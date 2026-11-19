import { memo, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMediaQuery, useTheme } from "@mui/material";
import ChartFigure from "./ChartFigure";
import ChartTooltip from "./ChartTooltip";
import { AXIS_STYLE, GRID_COLOR, niceScale } from "./chartUtils";
import MarkerDot from "./MarkerDot";
import { FORECAST_UNIT, TARGET_LABEL, getModelColor, getModelDisplayName } from "../../constants/models";
import { lastIntervalYear, withBand } from "../../utils/forecastTransforms";
import { formatAxisTick, formatValue } from "../../utils/format";

const singleRow = (row) => ({ forecast: row.forecast, lower: row.lower, upper: row.upper });

/** One model's forecast line with its prediction interval band. */
function ForecastBandChart({ model, rows, unit = FORECAST_UNIT }) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("sm"));
  const data = useMemo(() => withBand(rows), [rows]);
  const scale = useMemo(
    () => niceScale(rows.flatMap((r) => [r.forecast, r.lower, r.upper])),
    [rows]
  );
  const color = getModelColor(model);
  const name = getModelDisplayName(model);
  const intervalEnd = lastIntervalYear(rows);
  const lastYear = rows.at(-1)?.year;
  const first = rows[0];
  const last = rows.at(-1);

  const summary = first
    ? `${name} forecast of ${TARGET_LABEL.toLowerCase()} from ${first.year} to ${last.year}: ` +
      `${formatValue(first.forecast)} ${unit} in ${first.year} and ${formatValue(last.forecast)} ${unit} in ${last.year}.`
    : "No data.";

  return (
    <ChartFigure
      label={`${name} forecast chart`}
      summary={summary}
      height={compact ? 280 : 360}
      caption={
        intervalEnd === null
          ? "No prediction interval is available for this horizon."
          : intervalEnd < lastYear
            ? `Shaded band: prediction interval (available up to ${intervalEnd}). Later years have no calibrated interval.`
            : "Shaded band: prediction interval."
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: compact ? 8 : 16, bottom: 0, left: compact ? -8 : 0 }}>
          <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" tick={AXIS_STYLE} tickLine={false} axisLine={{ stroke: GRID_COLOR }} minTickGap={16} />
          <YAxis
            domain={scale.domain}
            ticks={scale.ticks}
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatAxisTick}
            width={compact ? 44 : 56}
            label={
              compact
                ? undefined
                : { value: unit, angle: -90, position: "insideLeft", offset: 10, style: AXIS_STYLE }
            }
          />
          <Tooltip
            cursor={{ stroke: GRID_COLOR }}
            content={<ChartTooltip models={[model]} unit={unit} getRow={singleRow} />}
          />
          <Area
            type="monotone"
            dataKey="band"
            stroke="none"
            fill={color}
            fillOpacity={0.14}
            isAnimationActive={false}
            name="Prediction interval"
            activeDot={false}
          />
          {intervalEnd !== null && intervalEnd < lastYear && (
            <ReferenceLine x={intervalEnd} stroke={GRID_COLOR} strokeDasharray="4 4" />
          )}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke={color}
            strokeWidth={2.25}
            dot={(props) => <MarkerDot key={`${model}-${props.index}`} model={model} cx={props.cx} cy={props.cy} />}
            activeDot={{ r: 5, stroke: color, fill: "#fff", strokeWidth: 2 }}
            isAnimationActive={false}
            name={name}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}

export default memo(ForecastBandChart);
