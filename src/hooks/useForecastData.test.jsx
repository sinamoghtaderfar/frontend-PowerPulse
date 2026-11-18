import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useForecastData } from "./useForecastData";
import { backendResponse, jsonResponse } from "../test/fixtures";

const deferred = () => {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
};

describe("useForecastData", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads data, reports errors and recovers on refresh", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ detail: "boom" }, 500))
      .mockResolvedValueOnce(jsonResponse(backendResponse));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useForecastData(2));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.error).toMatch(/encountered an error/));
    expect(result.current.loading).toBe(false);

    act(() => result.current.refresh());
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.prophet).toHaveLength(2);
  });

  it("ignores stale responses from superseded requests", async () => {
    const first = deferred();
    const second = deferred();
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useForecastData(2));
    act(() => result.current.refresh());

    const fresh = structuredClone(backendResponse);
    fresh.forecasts.prophet = [{ year: 2030, forecast: 1 }];
    await act(async () => second.resolve(jsonResponse(fresh)));
    await act(async () => first.resolve(jsonResponse(backendResponse)));

    expect(result.current.loading).toBe(false);
    expect(result.current.data.prophet).toEqual([{ year: 2030, forecast: 1, lower: null, upper: null }]);
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  });
});
