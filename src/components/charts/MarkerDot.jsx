import { MODEL_MARKERS, getModelColor } from "../../constants/models";

/** Line marker with a model-specific shape (circle, square, diamond). */
export default function MarkerDot({ model, cx, cy, radius = 3.5 }) {
  if (cx == null || cy == null) return null;
  const color = getModelColor(model);
  const common = { fill: "#fff", stroke: color, strokeWidth: 2 };
  const shape = MODEL_MARKERS[model] ?? "circle";
  if (shape === "square") {
    return <rect x={cx - radius} y={cy - radius} width={radius * 2} height={radius * 2} {...common} />;
  }
  if (shape === "diamond") {
    const r = radius + 1;
    return <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} {...common} />;
  }
  return <circle cx={cx} cy={cy} r={radius} {...common} />;
}
