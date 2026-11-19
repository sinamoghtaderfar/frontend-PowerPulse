import { palette } from "../../theme/tokens";

export const AXIS_STYLE = { fontSize: 12, fill: palette.textMuted };
export const GRID_COLOR = palette.border;

function niceStep(rawStep) {
  const exponent = Math.floor(Math.log10(rawStep));
  const base = 10 ** exponent;
  const fraction = rawStep / base;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * base;
}

/**
 * Y-axis scale with round tick values covering all finite values. The
 * domain is not forced to zero (forecasts sit far from it) but never
 * extends below zero.
 */
export function niceScale(values, tickCount = 5) {
  const finite = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  if (!finite.length) return { domain: [0, 1], ticks: [0, 1] };
  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.05, 1);
    min -= pad;
    max += pad;
  }
  const step = niceStep((max - min) / (tickCount - 1));
  const lo = Math.max(0, Math.floor(min / step) * step);
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(Number(t.toFixed(10)));
  return { domain: [lo, hi], ticks };
}
