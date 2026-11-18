import { normalizeAllForecasts } from "../utils/forecastTransforms";

/** API origin for production builds; empty = same origin / Vite dev proxy. */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/+$/,
  ""
);

export const DEFAULT_YEARS_AHEAD = 10;
export const MAX_YEARS_AHEAD = 50;
// The first request may trigger model training on the backend.
export const REQUEST_TIMEOUT_MS = 60_000;

export class ApiError extends Error {
  constructor(message, { status = null, cause } = {}) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = status;
  }
}

export function validateYearsAhead(value) {
  const years = Number(value);
  if (!Number.isInteger(years) || years < 1 || years > MAX_YEARS_AHEAD) {
    throw new RangeError(
      `years_ahead must be an integer between 1 and ${MAX_YEARS_AHEAD}`
    );
  }
  return years;
}

export const isAbortError = (error) => error?.name === "AbortError";

function messageForStatus(status, body) {
  if (status === 422) {
    const detail = body?.detail;
    const reason = Array.isArray(detail)
      ? detail
          .map((item) => (typeof item?.msg === "string" ? item.msg : null))
          .filter(Boolean)
          .join("; ")
      : typeof detail === "string"
        ? detail
        : "";
    return reason ? `Invalid request: ${reason}` : "Invalid request.";
  }
  if (status === 404) return "The forecast service endpoint was not found.";
  if (status >= 500)
    return "The forecast service encountered an error. Please try again later.";
  return `The forecast service returned an unexpected status (${status}).`;
}

async function requestJson(path, { signal, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
    } catch (error) {
      if (timedOut) {
        throw new ApiError("The forecast service took too long to respond.", {
          cause: error,
        });
      }
      if (isAbortError(error)) throw error;
      throw new ApiError(
        "Unable to reach the forecast service. Check your connection and try again.",
        { cause: error }
      );
    }

    let body = null;
    try {
      body = await response.json();
    } catch (error) {
      if (isAbortError(error) && !timedOut) throw error;
      if (response.ok) {
        throw new ApiError("Received an invalid response from the forecast service.", {
          status: response.status,
          cause: error,
        });
      }
    }

    if (!response.ok) {
      throw new ApiError(messageForStatus(response.status, body), {
        status: response.status,
      });
    }
    return body;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

/**
 * GET /forecast/all — forecasts of all models (Prophet, Random Forest, XGBoost).
 * Resolves to `{ prophet: Row[], random_forest: Row[], xgboost: Row[] }` where
 * Row is `{ year, forecast, lower, upper }`.
 */
export async function getAllForecasts(
  yearsAhead = DEFAULT_YEARS_AHEAD,
  { signal, timeoutMs } = {}
) {
  const years = validateYearsAhead(yearsAhead);
  const body = await requestJson(
    `/forecast/all?years_ahead=${encodeURIComponent(years)}`,
    { signal, timeoutMs }
  );
  try {
    return normalizeAllForecasts(body);
  } catch (error) {
    throw new ApiError("Received an invalid response from the forecast service.", {
      cause: error,
    });
  }
}
