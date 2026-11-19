import { useCallback, useEffect, useState } from "react";
import { DEFAULT_YEARS_AHEAD, getAllForecasts, isAbortError } from "../api/forecastApi";

const toErrorMessage = (error) =>
  error instanceof Error && (error.name === "ApiError" || error instanceof RangeError)
    ? error.message
    : "Failed to load forecast data.";

/**
 * Load `/forecast/all` for a horizon. Responses are cached per horizon for the
 * session (forecasts are deterministic server-side); `refresh` refetches.
 * Each request is aborted when superseded, so stale responses never win.
 *
 * Returns `{ data, previousData, loading, error, refresh }` where `data` is the
 * response for the requested horizon and `previousData` the last successful
 * response (useful to keep content visible while a new horizon loads).
 */
export function useForecastData(yearsAhead = DEFAULT_YEARS_AHEAD) {
  const [reloadCount, setReloadCount] = useState(0);
  const key = `${yearsAhead}:${reloadCount}`;
  const [state, setState] = useState({ cache: {}, errors: {}, last: null });
  const data = state.cache[key] ?? null;
  const error = state.errors[key] ?? null;
  const settled = data !== null || error !== null;

  useEffect(() => {
    if (settled) return undefined;
    const controller = new AbortController();
    getAllForecasts(yearsAhead, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setState((prev) => ({ ...prev, cache: { ...prev.cache, [key]: result }, last: result }));
      })
      .catch((err) => {
        if (controller.signal.aborted || isAbortError(err)) return;
        setState((prev) => ({ ...prev, errors: { ...prev.errors, [key]: toErrorMessage(err) } }));
      });
    return () => controller.abort();
  }, [key, yearsAhead, settled]);

  const refresh = useCallback(() => setReloadCount((count) => count + 1), []);

  return {
    data,
    previousData: state.last,
    loading: !settled,
    error,
    refresh,
  };
}
