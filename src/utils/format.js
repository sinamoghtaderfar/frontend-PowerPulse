const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

/** Format a forecast value with one decimal; "—" for missing values. */
export function formatValue(value) {
  return isFiniteNumber(value) ? numberFormatter.format(value) : "—";
}

/** Format a lower/upper interval; "—" if either bound is missing. */
export function formatInterval(lower, upper) {
  return isFiniteNumber(lower) && isFiniteNumber(upper)
    ? `${formatValue(lower)} – ${formatValue(upper)}`
    : "—";
}

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const axisFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Value with unit, e.g. "512.3 TWh"; "—" for missing values. */
export function formatWithUnit(value, unit) {
  return isFiniteNumber(value) ? `${formatValue(value)} ${unit}` : "—";
}

/** Signed percentage with two decimals, e.g. "+1.25 %"; "—" if missing. */
export function formatPercent(value) {
  return isFiniteNumber(value) ? `${percentFormatter.format(value)} %` : "—";
}

/** Integer axis tick label. */
export function formatAxisTick(value) {
  return isFiniteNumber(value) ? axisFormatter.format(value) : "";
}
