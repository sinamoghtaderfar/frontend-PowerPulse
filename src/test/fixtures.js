import { vi } from "vitest";
/**
 * Responses shaped exactly like api-Forecast-PowerPulse v1.1.0
 * (`AllForecastsResponse`, `HealthResponse`).
 */
const BASE = { prophet: 495.5, random_forest: 520.9, xgboost: 514.7 };
const SLOPE = { prophet: -15, random_forest: 1.5, xgboost: -0.5 };
const MAX_CALIBRATED = 11;

function rowsFor(model, years) {
  return Array.from({ length: years }, (_, i) => {
    const forecast = BASE[model] + SLOPE[model] * i;
    const half = i < MAX_CALIBRATED ? 70 + 8 * i : null;
    const row = {
      year: 2026 + i,
      forecast,
      lower: half === null ? null : forecast - half,
      upper: half === null ? null : forecast + half,
    };
    if (model === "random_forest") {
      row.uncertainty_width = half === null ? null : 2 * half;
      row.growth_rate = 0.5;
    }
    if (model === "xgboost") row.growth_from_previous = -0.1;
    return row;
  });
}

function summaryFor(model, rows, name) {
  const start = rows[0].forecast;
  const end = rows.at(-1).forecast;
  const periods = rows.length - 1;
  return {
    model: name,
    period: `${rows[0].year}-${rows.at(-1).year}`,
    start_value: start,
    end_value: end,
    growth_periods: periods,
    total_growth_percent: periods ? Number(((end / start - 1) * 100).toFixed(2)) : null,
    avg_annual_growth: periods ? Number((((end / start) ** (1 / periods) - 1) * 100).toFixed(2)) : null,
    avg_uncertainty_width: 150,
  };
}

const intervalInfo = {
  method: "rolling-origin backtest residuals (split-conformal, per horizon)",
  nominal_coverage: 0.95,
  max_calibrated_horizon: MAX_CALIBRATED,
  residuals_per_horizon: { 1: 29, 2: 28 },
};

export function backendResponse(years = 10, { unavailable = [] } = {}) {
  const names = { prophet: "Prophet", random_forest: "Random Forest", xgboost: "XGBoost" };
  const forecasts = {};
  const summaries = {};
  for (const model of Object.keys(names)) {
    const rows = unavailable.includes(model) ? [] : rowsFor(model, years);
    forecasts[model] = rows;
    summaries[model] = rows.length ? summaryFor(model, rows, names[model]) : null;
  }
  return {
    forecasts,
    summaries,
    metadata: {
      years_ahead: years,
      models: Object.keys(names),
      units: {
        target: "electricity_generation",
        forecast: "TWh",
        uncertainty:
          "empirical prediction interval targeting 95% coverage from rolling-origin backtest residuals; backtested coverage was below nominal (see README)",
      },
      intervals: Object.fromEntries(
        Object.keys(names).map((m) => [m, unavailable.includes(m) ? null : intervalInfo])
      ),
      unavailable_models: unavailable,
    },
  };
}

export const healthResponse = (models = {}) => {
  const all = { prophet: true, random_forest: true, xgboost: true, ...models };
  const healthy = Object.values(all).every(Boolean);
  return { status: healthy ? "healthy" : "degraded", models_loaded: healthy, models: all, api_version: "1.1.0" };
};

export const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/**
 * fetch mock that routes `/health` and `/forecast/all` like the backend.
 * `handlers.forecast(url)` may return a Response / Promise to override.
 */
export function createBackendFetch(handlers = {}) {
  return vi.fn((input) => {
    const url = new URL(String(input), "http://localhost");
    if (url.pathname === "/health") {
      return Promise.resolve(handlers.health ? handlers.health() : jsonResponse(healthResponse()));
    }
    if (url.pathname === "/forecast/all") {
      if (handlers.forecast) return Promise.resolve(handlers.forecast(url));
      const years = Number(url.searchParams.get("years_ahead"));
      return Promise.resolve(jsonResponse(backendResponse(years)));
    }
    return Promise.resolve(jsonResponse({ detail: "Not Found" }, 404));
  });
}
