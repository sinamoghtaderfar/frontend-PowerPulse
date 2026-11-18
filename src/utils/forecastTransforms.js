import { MODEL_KEYS } from "../constants/models";
import { isFiniteNumber } from "./format";

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
};

/**
 * Validate and normalise one model's forecast rows from the API.
 * Rows without a valid integer year or forecast value are dropped, bounds that
 * are missing or inconsistent become null, and rows are sorted by year.
 */
export function normalizeForecastRows(rows) {
  if (!Array.isArray(rows)) return [];
  const byYear = new Map();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const year = toNumberOrNull(row.year);
    const forecast = toNumberOrNull(row.forecast);
    if (year === null || !Number.isInteger(year) || forecast === null) continue;
    let lower = toNumberOrNull(row.lower);
    let upper = toNumberOrNull(row.upper);
    if (lower !== null && upper !== null && lower > upper) {
      lower = null;
      upper = null;
    }
    byYear.set(year, { year, forecast, lower, upper });
  }
  return [...byYear.values()].sort((a, b) => a.year - b.year);
}

/**
 * Normalise the `/forecast/all` payload. Throws if the payload does not
 * contain a `forecasts` object; unknown models are ignored and missing
 * models become empty arrays.
 */
export function normalizeAllForecasts(payload) {
  const forecasts = payload?.forecasts;
  if (!forecasts || typeof forecasts !== "object" || Array.isArray(forecasts)) {
    throw new TypeError("Response does not contain forecasts");
  }
  return Object.fromEntries(
    MODEL_KEYS.map((model) => [model, normalizeForecastRows(forecasts[model])])
  );
}

export const hasAnyForecast = (data) =>
  MODEL_KEYS.some((model) => (data?.[model]?.length ?? 0) > 0);

/**
 * Pivot per-model rows into one row per year for the comparison chart/table:
 * `{ year, prophet, prophet_lower, prophet_upper, random_forest, ... }`.
 */
export function toComparisonRows(data) {
  const rows = new Map();
  for (const model of MODEL_KEYS) {
    for (const point of data?.[model] ?? []) {
      if (!rows.has(point.year)) {
        const empty = { year: point.year };
        for (const key of MODEL_KEYS) {
          empty[key] = null;
          empty[`${key}_lower`] = null;
          empty[`${key}_upper`] = null;
        }
        rows.set(point.year, empty);
      }
      const row = rows.get(point.year);
      row[model] = isFiniteNumber(point.forecast) ? point.forecast : null;
      row[`${model}_lower`] = isFiniteNumber(point.lower) ? point.lower : null;
      row[`${model}_upper`] = isFiniteNumber(point.upper) ? point.upper : null;
    }
  }
  return [...rows.values()].sort((a, b) => a.year - b.year);
}
