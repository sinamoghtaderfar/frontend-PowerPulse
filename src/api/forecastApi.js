import { ApiError, requestJson } from "./client";
import { normalizeForecastResponse, normalizeHealth } from "../utils/forecastTransforms";

export { ApiError, API_BASE_URL, isAbortError, REQUEST_TIMEOUT_MS } from "./client";

export const DEFAULT_YEARS_AHEAD = 10;
/** Backend limit: `years_ahead` is an integer in [1, 50]. */
export const MAX_YEARS_AHEAD = 50;

export function validateYearsAhead(value) {
  const years = Number(value);
  if (!Number.isInteger(years) || years < 1 || years > MAX_YEARS_AHEAD) {
    throw new RangeError(`years_ahead must be an integer between 1 and ${MAX_YEARS_AHEAD}`);
  }
  return years;
}

const invalidResponse = (cause) =>
  new ApiError("Received an invalid response from the forecast service.", { cause });

/**
 * GET /forecast/all — forecasts, growth summaries and interval metadata of
 * all models (Prophet, Random Forest, XGBoost). See `normalizeForecastResponse`.
 */
export async function getAllForecasts(yearsAhead = DEFAULT_YEARS_AHEAD, options = {}) {
  const years = validateYearsAhead(yearsAhead);
  const body = await requestJson(`/forecast/all?years_ahead=${years}`, options);
  try {
    return normalizeForecastResponse(body);
  } catch (error) {
    throw invalidResponse(error);
  }
}

/** GET /health — API status and per-model availability (always HTTP 200). */
export async function getHealth(options = {}) {
  const body = await requestJson("/health", { timeoutMs: 10_000, ...options });
  try {
    return normalizeHealth(body);
  } catch (error) {
    throw invalidResponse(error);
  }
}
