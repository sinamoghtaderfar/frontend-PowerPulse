import { MODEL_KEYS } from "../constants/models";
import { isFiniteNumber } from "./format";

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "" || typeof value === "boolean") {
    return null;
  }
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
};

const toStringOrNull = (value) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, 500) : null;

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/**
 * Validate and normalise one model's forecast rows from the API.
 * Rows without a valid integer year or forecast value are dropped, bounds that
 * are missing or inconsistent become null, and rows are sorted by year.
 */
export function normalizeForecastRows(rows) {
  if (!Array.isArray(rows)) return [];
  const byYear = new Map();
  for (const row of rows) {
    if (!isPlainObject(row)) continue;
    const year = toNumberOrNull(row.year);
    const forecast = toNumberOrNull(row.forecast);
    if (year === null || !Number.isInteger(year) || forecast === null) continue;
    let lower = toNumberOrNull(row.lower);
    let upper = toNumberOrNull(row.upper);
    if (lower === null || upper === null || lower > upper) {
      lower = null;
      upper = null;
    }
    byYear.set(year, { year, forecast, lower, upper });
  }
  return [...byYear.values()].sort((a, b) => a.year - b.year);
}

/** Normalise a backend `ModelSummary` (null if missing or invalid). */
export function normalizeSummary(summary) {
  if (!isPlainObject(summary)) return null;
  const startValue = toNumberOrNull(summary.start_value);
  const endValue = toNumberOrNull(summary.end_value);
  if (startValue === null || endValue === null) return null;
  const periods = toNumberOrNull(summary.growth_periods);
  return {
    period: toStringOrNull(summary.period),
    startValue,
    endValue,
    growthPeriods: periods !== null && Number.isInteger(periods) && periods >= 0 ? periods : null,
    totalGrowthPercent: toNumberOrNull(summary.total_growth_percent),
    avgAnnualGrowth: toNumberOrNull(summary.avg_annual_growth),
    avgUncertaintyWidth: toNumberOrNull(summary.avg_uncertainty_width),
  };
}

function normalizeIntervalInfo(info) {
  if (!isPlainObject(info)) return null;
  const maxHorizon = toNumberOrNull(info.max_calibrated_horizon);
  const coverage = toNumberOrNull(info.nominal_coverage);
  return {
    method: toStringOrNull(info.method),
    nominalCoverage: coverage !== null && coverage > 0 && coverage < 1 ? coverage : null,
    maxCalibratedHorizon:
      maxHorizon !== null && Number.isInteger(maxHorizon) && maxHorizon >= 0 ? maxHorizon : null,
  };
}

/** Normalise `/forecast/all` metadata, keeping only known fields. */
export function normalizeMetadata(metadata) {
  const meta = isPlainObject(metadata) ? metadata : {};
  const units = isPlainObject(meta.units) ? meta.units : {};
  const intervals = isPlainObject(meta.intervals) ? meta.intervals : {};
  const unavailable = Array.isArray(meta.unavailable_models) ? meta.unavailable_models : [];
  const years = toNumberOrNull(meta.years_ahead);
  return {
    yearsAhead: years !== null && Number.isInteger(years) ? years : null,
    units: {
      target: toStringOrNull(units.target),
      forecast: toStringOrNull(units.forecast),
      uncertainty: toStringOrNull(units.uncertainty),
    },
    intervals: Object.fromEntries(
      MODEL_KEYS.map((model) => [model, normalizeIntervalInfo(intervals[model])])
    ),
    unavailableModels: MODEL_KEYS.filter((model) => unavailable.includes(model)),
  };
}

/**
 * Normalise the `/forecast/all` forecasts object. Throws if the payload does
 * not contain a `forecasts` object; unknown models are ignored and missing
 * models become empty arrays.
 */
export function normalizeAllForecasts(payload) {
  const forecasts = payload?.forecasts;
  if (!isPlainObject(forecasts)) {
    throw new TypeError("Response does not contain forecasts");
  }
  return Object.fromEntries(
    MODEL_KEYS.map((model) => [model, normalizeForecastRows(forecasts[model])])
  );
}

/** Normalise the complete `/forecast/all` response. */
export function normalizeForecastResponse(payload) {
  const forecasts = normalizeAllForecasts(payload);
  const summaries = isPlainObject(payload.summaries) ? payload.summaries : {};
  return {
    forecasts,
    summaries: Object.fromEntries(
      MODEL_KEYS.map((model) => [model, normalizeSummary(summaries[model])])
    ),
    metadata: normalizeMetadata(payload.metadata),
  };
}

/** Normalise `/health`. */
export function normalizeHealth(payload) {
  if (!isPlainObject(payload) || typeof payload.status !== "string") {
    throw new TypeError("Invalid health response");
  }
  const models = isPlainObject(payload.models) ? payload.models : {};
  return {
    status: payload.status === "healthy" ? "healthy" : "degraded",
    models: Object.fromEntries(MODEL_KEYS.map((model) => [model, models[model] === true])),
    apiVersion: toStringOrNull(payload.api_version),
  };
}

export const hasAnyForecast = (forecasts) =>
  MODEL_KEYS.some((model) => (forecasts?.[model]?.length ?? 0) > 0);

/** Models that returned at least one forecast row. */
export const availableModels = (forecasts) =>
  MODEL_KEYS.filter((model) => (forecasts?.[model]?.length ?? 0) > 0);

/** Add a `[lower, upper]` range (or null) per row for band charts. */
export const withBand = (rows) =>
  rows.map((row) => ({
    ...row,
    band: isFiniteNumber(row.lower) && isFiniteNumber(row.upper) ? [row.lower, row.upper] : null,
  }));

/**
 * Pivot per-model rows into one row per year for the comparison chart/table:
 * `{ year, prophet, prophet_lower, prophet_upper, prophet_band, ... }`.
 */
export function toComparisonRows(forecasts) {
  const rows = new Map();
  for (const model of MODEL_KEYS) {
    for (const point of forecasts?.[model] ?? []) {
      if (!rows.has(point.year)) {
        const empty = { year: point.year };
        for (const key of MODEL_KEYS) {
          empty[key] = null;
          empty[`${key}_lower`] = null;
          empty[`${key}_upper`] = null;
          empty[`${key}_band`] = null;
        }
        rows.set(point.year, empty);
      }
      const row = rows.get(point.year);
      const hasBand = isFiniteNumber(point.lower) && isFiniteNumber(point.upper);
      row[model] = isFiniteNumber(point.forecast) ? point.forecast : null;
      row[`${model}_lower`] = hasBand ? point.lower : null;
      row[`${model}_upper`] = hasBand ? point.upper : null;
      row[`${model}_band`] = hasBand ? [point.lower, point.upper] : null;
    }
  }
  return [...rows.values()].sort((a, b) => a.year - b.year);
}

/**
 * Spread across models per year: min, max and range of the point forecasts
 * (only years where at least two models have a value).
 */
export function modelSpread(comparisonRows) {
  return comparisonRows
    .map((row) => {
      const values = MODEL_KEYS.map((m) => row[m]).filter(isFiniteNumber);
      if (values.length < 2) return null;
      const min = Math.min(...values);
      const max = Math.max(...values);
      return { year: row.year, min, max, range: max - min };
    })
    .filter(Boolean);
}

/** Last year that has an interval for the given rows (null if none). */
export function lastIntervalYear(rows) {
  const withBounds = rows.filter((r) => isFiniteNumber(r.lower) && isFiniteNumber(r.upper));
  return withBounds.length ? withBounds[withBounds.length - 1].year : null;
}
