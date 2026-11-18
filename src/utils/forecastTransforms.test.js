import { describe, expect, it } from "vitest";
import {
  hasAnyForecast,
  normalizeAllForecasts,
  normalizeForecastRows,
  toComparisonRows,
} from "./forecastTransforms";
import { formatInterval, formatValue } from "./format";

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
    ]);
    expect(rows).toEqual([
      { year: 2026, forecast: 1, lower: 0.5, upper: 1.5 },
      { year: 2027, forecast: 2, lower: null, upper: null },
    ]);
  });

  it("discards inconsistent bounds", () => {
    expect(normalizeForecastRows([{ year: 2026, forecast: 5, lower: 9, upper: 1 }])[0]).toMatchObject({
      lower: null,
      upper: null,
    });
  });

  it("returns [] for non-arrays", () => {
    expect(normalizeForecastRows(undefined)).toEqual([]);
    expect(normalizeForecastRows({})).toEqual([]);
  });
});

describe("normalizeAllForecasts", () => {
  it("fills missing models and ignores unknown ones", () => {
    const data = normalizeAllForecasts({ forecasts: { prophet: [{ year: 2026, forecast: 1 }], other: [] } });
    expect(data).toEqual({ prophet: [{ year: 2026, forecast: 1, lower: null, upper: null }], random_forest: [], xgboost: [] });
    expect(hasAnyForecast(data)).toBe(true);
    expect(hasAnyForecast({ prophet: [], random_forest: [], xgboost: [] })).toBe(false);
  });

  it("throws without a forecasts object", () => {
    expect(() => normalizeAllForecasts(null)).toThrow();
    expect(() => normalizeAllForecasts({ forecasts: [] })).toThrow();
  });
});

describe("toComparisonRows", () => {
  it("pivots models per year and keeps zero values", () => {
    const rows = toComparisonRows({
      prophet: [{ year: 2027, forecast: 0, lower: 0, upper: 1 }],
      xgboost: [{ year: 2026, forecast: 3, lower: null, upper: null }],
    });
    expect(rows.map((r) => r.year)).toEqual([2026, 2027]);
    expect(rows[1]).toMatchObject({ prophet: 0, prophet_lower: 0, prophet_upper: 1, xgboost: null });
    expect(rows[0]).toMatchObject({ xgboost: 3, prophet: null, random_forest: null });
  });
});

describe("format", () => {
  it("formats values and intervals", () => {
    expect(formatValue(1234.567)).toBe("1,234.6");
    expect(formatValue(0)).toBe("0.0");
    expect(formatValue(null)).toBe("—");
    expect(formatInterval(1, 2)).toBe("1.0 – 2.0");
    expect(formatInterval(null, 2)).toBe("—");
  });
});
