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
