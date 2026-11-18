import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, getAllForecasts, validateYearsAhead } from "./energyApi";
import { backendResponse, jsonResponse } from "../test/fixtures";

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

  it("calls the real backend endpoint and normalises the response", async () => {
    fetchMock.mockResolvedValue(jsonResponse(backendResponse));
    const data = await getAllForecasts(2);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/forecast/all?years_ahead=2");
    expect(Object.keys(data)).toEqual(["prophet", "random_forest", "xgboost"]);
    expect(data.random_forest[0]).toEqual({ year: 2026, forecast: 511.3, lower: 460, upper: 562.6 });
  });

  it.each([0, -1, 2.5, 51, "abc"])("rejects invalid years_ahead %p without a request", async (value) => {
    await expect(getAllForecasts(value)).rejects.toBeInstanceOf(RangeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces FastAPI 422 validation messages", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: [{ loc: ["query", "years_ahead"], msg: "Input should be a valid integer" }] }, 422)
    );
    await expect(getAllForecasts(5)).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      message: "Invalid request: Input should be a valid integer",
    });
  });

  it("does not leak backend internals on server errors", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "Error getting forecasts: KeyError 'gdp' at /srv/app" }, 500));
    const error = await getAllForecasts(5).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
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
    fetchMock.mockImplementation(
      (_url, { signal }) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
        )
    );
    const controller = new AbortController();
    const pending = getAllForecasts(5, { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("times out slow requests", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, { signal }) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
        )
    );
    const pending = getAllForecasts(5, { timeoutMs: 1000 });
    const assertion = expect(pending).rejects.toThrow(/took too long/);
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });
});

describe("validateYearsAhead", () => {
  it("accepts integers in range", () => {
    expect(validateYearsAhead(1)).toBe(1);
    expect(validateYearsAhead("10")).toBe(10);
    expect(validateYearsAhead(50)).toBe(50);
  });
});
