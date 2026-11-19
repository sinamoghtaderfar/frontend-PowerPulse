/** API origin for production builds; empty = same origin / Vite dev proxy. */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

// The first request after a backend restart may wait for model training.
export const REQUEST_TIMEOUT_MS = 60_000;

export class ApiError extends Error {
  constructor(message, { status = null, cause } = {}) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = status;
  }
}

export const isAbortError = (error) => error?.name === "AbortError";

function messageForStatus(status, body) {
  const detail = body?.detail;
  if (status === 422) {
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
  if (status === 503) {
    // Backend 503 details are short, user-facing messages ("… is not available").
    return typeof detail === "string" && detail.length < 200
      ? `${detail}. The forecasting service may still be starting — try again shortly.`
      : "The forecasting service is temporarily unavailable. Try again shortly.";
  }
  if (status === 404) return "The forecast service endpoint was not found.";
  if (status >= 500) return "The forecast service encountered an error. Please try again later.";
  return `The forecast service returned an unexpected status (${status}).`;
}

/**
 * GET a JSON resource with a timeout, caller cancellation and safe error
 * messages. Caller aborts reject with the original AbortError.
 */
export async function requestJson(path, { signal, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
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
        throw new ApiError("The forecast service took too long to respond.", { cause: error });
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
      throw new ApiError(messageForStatus(response.status, body), { status: response.status });
    }
    return body;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}
