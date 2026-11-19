import { describe, expect, it } from "vitest";
import {
  availableModels,
  hasAnyForecast,
  lastIntervalYear,
  modelSpread,
  normalizeAllForecasts,
  normalizeForecastResponse,
  normalizeForecastRows,
  normalizeHealth,
  normalizeMetadata,
  normalizeSummary,
  toComparisonRows,
  withBand,
} from "./forecastTransforms";
import { formatInterval, formatPercent, formatValue, formatWithUnit } from "./format";
import { niceScale } from "../components/charts/chartUtils";
import { backendResponse } from "../test/fixtures";

describe("normalizeForecastRows", () => {
  it("drops invalid rows, sorts by year and dedupes years", () => {
    const rows = normalizeForecastRows([
      { year: 2027, forecast: 2 },
      null,
      { year: "x", forecast: 1 },
      { year: 2026.5, forecast: 1 },
      { year: 2026, forecast: null },
      { year: 2026, forecast: 1, lower: "0.5", upper: 1.5 },
      { year: 2028, forecast: Number.NaN },
      { year: true, forecast: 3 },
    ]);
    expect(rows).toEqual([
      { year: 2026, forecast: 1, lower: 0.5, upper: 1.5 },
      { year: 2027, forecast: 2, lower: null, upper: null },
    ]);
  });

  it("drops inconsistent or one-sided bounds and keeps zero values", () => {
    expect(normalizeForecastRows([{ year: 2026, forecast: 5, lower: 9, upper: 1 }])[0].lower).toBeNull();
    expect(normalizeForecastRows([{ year: 2026, forecast: 5, lower: 1, upper: null }])[0].lower).toBeNull();
    expect(normalizeForecastRows([{ year: 2026, forecast: 0, lower: 0, upper: 0 }])[0]).toEqual({
      year: 2026,
      forecast: 0,
      lower: 0,
      upper: 0,
    });
  });

  it("returns [] for non-arrays", () => {
    expect(normalizeForecastRows(undefined)).toEqual([]);
    expect(normalizeForecastRows({})).toEqual([]);
  });
});

describe("response normalisation", () => {
  it("handles the real backend shape, including null bounds beyond the calibrated horizon", () => {
    const data = normalizeForecastResponse(backendResponse(13));
    expect(data.forecasts.prophet).toHaveLength(13);
    expect(data.forecasts.prophet.at(-1)).toMatchObject({ lower: null, upper: null });
    expect(lastIntervalYear(data.forecasts.prophet)).toBe(2036);
  });

  it("fills missing models and ignores unknown ones", () => {
    const data = normalizeAllForecasts({ forecasts: { prophet: [{ year: 2026, forecast: 1 }], other: [] } });
    expect(data.random_forest).toEqual([]);
    expect(hasAnyForecast(data)).toBe(true);
    expect(availableModels(data)).toEqual(["prophet"]);
    expect(hasAnyForecast({ prophet: [], random_forest: [], xgboost: [] })).toBe(false);
  });

  it("throws without a forecasts object", () => {
    expect(() => normalizeAllForecasts(null)).toThrow();
    expect(() => normalizeAllForecasts({ forecasts: [] })).toThrow();
  });

  it("validates summaries and metadata defensively", () => {
    expect(normalizeSummary(null)).toBeNull();
    expect(normalizeSummary({ start_value: "x", end_value: 1 })).toBeNull();
    expect(normalizeSummary({ start_value: 1, end_value: 2, growth_periods: -1, avg_annual_growth: "bad" })).toMatchObject({
      growthPeriods: null,
      avgAnnualGrowth: null,
    });
    const meta = normalizeMetadata({
      units: { forecast: 5 },
      intervals: { prophet: { nominal_coverage: 7, max_calibrated_horizon: 2.5 } },
      unavailable_models: ["xgboost", "<script>"],
    });
    expect(meta.units.forecast).toBeNull();
    expect(meta.intervals.prophet).toMatchObject({ nominalCoverage: null, maxCalibratedHorizon: null });
    expect(meta.unavailableModels).toEqual(["xgboost"]);
    expect(normalizeMetadata(undefined).unavailableModels).toEqual([]);
  });

  it("normalises health", () => {
    expect(normalizeHealth({ status: "healthy", models: { prophet: true } }).models).toEqual({
      prophet: true,
      random_forest: false,
      xgboost: false,
    });
    expect(() => normalizeHealth({})).toThrow();
  });
});

describe("chart transforms", () => {
  it("pivots models per year and keeps zero values", () => {
    const rows = toComparisonRows({
      prophet: [{ year: 2027, forecast: 0, lower: 0, upper: 1 }],
      xgboost: [{ year: 2026, forecast: 3, lower: null, upper: null }],
    });
    expect(rows.map((r) => r.year)).toEqual([2026, 2027]);
    expect(rows[1]).toMatchObject({ prophet: 0, prophet_band: [0, 1], xgboost: null });
    expect(rows[0]).toMatchObject({ xgboost: 3, xgboost_band: null, random_forest: null });
  });

  it("builds bands only where both bounds exist", () => {
    expect(withBand([{ year: 1, forecast: 2, lower: 1, upper: 3 }, { year: 2, forecast: 2, lower: null, upper: null }])
      .map((r) => r.band)).toEqual([[1, 3], null]);
  });

  it("computes the spread across models", () => {
    const rows = toComparisonRows({
      prophet: [{ year: 2026, forecast: 400 }],
      random_forest: [{ year: 2026, forecast: 520 }, { year: 2027, forecast: 1 }],
    });
    expect(modelSpread(rows)).toEqual([{ year: 2026, min: 400, max: 520, range: 120 }]);
  });

  it("creates round axis ticks that cover the data without forcing zero", () => {
    const { domain, ticks } = niceScale([321.5, 536.8, 601.5]);
    expect(domain[0]).toBeLessThanOrEqual(321.5);
    expect(domain[1]).toBeGreaterThanOrEqual(601.5);
    expect(domain[0]).toBeGreaterThan(0);
    expect(ticks.every((t) => t % 50 === 0)).toBe(true);
    expect(niceScale([]).domain).toEqual([0, 1]);
    expect(niceScale([500, 500]).ticks.length).toBeGreaterThan(1);
  });
});

describe("format", () => {
  it("formats values, units, percentages and intervals", () => {
    expect(formatValue(1234.567)).toBe("1,234.6");
    expect(formatValue(0)).toBe("0.0");
    expect(formatValue(null)).toBe("—");
    expect(formatWithUnit(5, "TWh")).toBe("5.0 TWh");
    expect(formatPercent(-4.69)).toBe("-4.69 %");
    expect(formatPercent(0.34)).toBe("+0.34 %");
    expect(formatPercent(null)).toBe("—");
    expect(formatInterval(1, 2)).toBe("1.0 – 2.0");
    expect(formatInterval(null, 2)).toBe("—");
  });
});
