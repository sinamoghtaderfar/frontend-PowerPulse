import { useCallback, useEffect, useState } from "react";
import { DEFAULT_YEARS_AHEAD, getAllForecasts, isAbortError } from "../api/energyApi";
import { MODEL_KEYS } from "../constants/models";

const EMPTY_DATA = Object.fromEntries(MODEL_KEYS.map((model) => [model, []]));

const toErrorMessage = (error) =>
  error instanceof Error && (error.name === "ApiError" || error instanceof RangeError)
    ? error.message
    : "Failed to load forecast data.";

/**
 * Load forecasts of all models. Each (re)load aborts the previous request and
 * results are tagged with the request they belong to, so stale responses never
 * overwrite newer state.
 */
export function useForecastData(yearsAhead = DEFAULT_YEARS_AHEAD) {
  const [reloadCount, setReloadCount] = useState(0);
  const requestKey = `${yearsAhead}:${reloadCount}`;
  const [result, setResult] = useState({ key: null, data: EMPTY_DATA, error: null });

  useEffect(() => {
    const controller = new AbortController();

    getAllForecasts(yearsAhead, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, data, error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        setResult((prev) => ({ key: requestKey, data: prev.data, error: toErrorMessage(error) }));
      });

    return () => controller.abort();
  }, [yearsAhead, requestKey]);

  const refresh = useCallback(() => setReloadCount((count) => count + 1), []);

  return {
    data: result.data,
    loading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : null,
    refresh,
  };
}
