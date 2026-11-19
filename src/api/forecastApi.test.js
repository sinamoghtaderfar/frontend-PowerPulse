import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, getAllForecasts, getHealth, validateYearsAhead } from "./forecastApi";
import { backendResponse, healthResponse, jsonResponse } from "../test/fixtures";

const pending = () =>
  vi.fn(
    (_url, { signal }) =>
      new Promise((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
      )
  );

describe("getAllForecasts", () => {
  let fetchMock;
  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("calls the real backend endpoint and normalises forecasts, summaries and metadata", async () => {
    fetchMock.mockResolvedValue(jsonResponse(backendResponse(3)));
    const data = await getAllForecasts(3);

    expect(fetchMock.mock.calls[0][0]).toBe("/forecast/all?years_ahead=3");
    expect(Object.keys(data.forecasts)).toEqual(["prophet", "random_forest", "xgboost"]);
    expect(data.forecasts.random_forest[0]).toEqual({ year: 2026, forecast: 520.9, lower: 450.9, upper: 590.9 });
    expect(data.summaries.prophet).toMatchObject({ period: "2026-2028", growthPeriods: 2, startValue: 495.5 });
    expect(data.metadata).toMatchObject({
      yearsAhead: 3,
      units: { target: "electricity_generation", forecast: "TWh" },
      unavailableModels: [],
    });
    expect(data.metadata.intervals.xgboost).toMatchObject({ nominalCoverage: 0.95, maxCalibratedHorizon: 11 });
  });

  it.each([0, -1, 2.5, 51, "abc"])("rejects invalid years_ahead %p without a request", async (value) => {
    await expect(getAllForecasts(value)).rejects.toBeInstanceOf(RangeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces FastAPI 422 validation messages", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: [{ msg: "Input should be less than or equal to 50" }] }, 422));
    await expect(getAllForecasts(5)).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      message: "Invalid request: Input should be less than or equal to 50",
    });
  });

  it("explains 503 (no model available) from the backend", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "No forecasting model is available" }, 503));
    await expect(getAllForecasts(5)).rejects.toThrow(/No forecasting model is available.*try again/);
  });

  it("does not leak backend internals on server errors", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "KeyError at /srv/app/x.py" }, 500));
    const error = await getAllForecasts(5).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).not.toMatch(/KeyError|srv/);
  });

  it("maps network failures to a friendly error", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(getAllForecasts(5)).rejects.toThrow(/Unable to reach the forecast service/);
  });

  it("rejects malformed payloads", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ unexpected: true }));
    await expect(getAllForecasts(5)).rejects.toThrow(/invalid response/);
    fetchMock.mockResolvedValue(new Response("<html>", { status: 200 }));
    await expect(getAllForecasts(5)).rejects.toThrow(/invalid response/);
  });

  it("propagates caller aborts as AbortError", async () => {
    vi.stubGlobal("fetch", pending());
    const controller = new AbortController();
    const request = getAllForecasts(5, { signal: controller.signal });
    controller.abort();
    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });

  it("times out slow requests", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", pending());
    const request = getAllForecasts(5, { timeoutMs: 1000 });
    const assertion = expect(request).rejects.toThrow(/took too long/);
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });
});

describe("getHealth", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("normalises the health response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(healthResponse({ xgboost: false }))));
    await expect(getHealth()).resolves.toEqual({
      status: "degraded",
      models: { prophet: true, random_forest: true, xgboost: false },
      apiVersion: "1.1.0",
    });
  });

  it("rejects invalid health payloads", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([])));
    await expect(getHealth()).rejects.toThrow(/invalid response/);
  });
});

describe("validateYearsAhead", () => {
  it("accepts integers in the backend range", () => {
    expect(validateYearsAhead(1)).toBe(1);
    expect(validateYearsAhead("10")).toBe(10);
    expect(validateYearsAhead(50)).toBe(50);
  });
});
