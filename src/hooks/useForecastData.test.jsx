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
      .mockResolvedValueOnce(jsonResponse(backendResponse(2)));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useForecastData(2));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.error).toMatch(/encountered an error/));

    act(() => result.current.refresh());
    expect(result.current.error).toBeNull();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.forecasts.prophet).toHaveLength(2);
  });

  it("caches per horizon and keeps the previous result while loading", async () => {
    const fetchMock = vi.fn((url) =>
      Promise.resolve(jsonResponse(backendResponse(Number(new URL(url, "http://x").searchParams.get("years_ahead")))))
    );
    vi.stubGlobal("fetch", fetchMock);
    const { result, rerender } = renderHook(({ years }) => useForecastData(years), { initialProps: { years: 3 } });
    await waitFor(() => expect(result.current.data?.metadata.yearsAhead).toBe(3));

    rerender({ years: 5 });
    expect(result.current.data).toBeNull();
    expect(result.current.previousData.metadata.yearsAhead).toBe(3);
    await waitFor(() => expect(result.current.data?.metadata.yearsAhead).toBe(5));

    rerender({ years: 3 });
    expect(result.current.loading).toBe(false);
    expect(result.current.data.metadata.yearsAhead).toBe(3);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ignores stale responses from superseded requests", async () => {
    const first = deferred();
    const second = deferred();
    const fetchMock = vi.fn().mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise);
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(({ years }) => useForecastData(years), { initialProps: { years: 3 } });
    rerender({ years: 5 });
    await act(async () => second.resolve(jsonResponse(backendResponse(5))));
    await act(async () => first.resolve(jsonResponse(backendResponse(3))));

    expect(result.current.data.metadata.yearsAhead).toBe(5);
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  });
});
