import { memo, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
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
import { FORECAST_UNIT, getModelColor, getModelDisplayName } from "../../constants/models";
import { formatAxisTick, formatValue } from "../../utils/format";

const comparisonRow = (row, model) => ({
  forecast: row[model],
  lower: row[`${model}_lower`],
  upper: row[`${model}_upper`],
});

/**
 * Forecasts of several models on one axis. `rows` come from `toComparisonRows`;
 * `bandModels` lists models whose interval band is drawn.
 */
function ComparisonChart({ rows, models, bandModels = [], unit = FORECAST_UNIT }) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("sm"));
  const scale = useMemo(
    () =>
      niceScale(
        rows.flatMap((row) =>
          models.flatMap((m) => [
            row[m],
            ...(bandModels.includes(m) ? [row[`${m}_lower`], row[`${m}_upper`]] : []),
          ])
        )
      ),
    [rows, models, bandModels]
  );

  const last = rows.at(-1);
  const summary = last
    ? `Forecasts for ${last.year}: ` +
      models.map((m) => `${getModelDisplayName(m)} ${formatValue(last[m])} ${unit}`).join(", ") +
      "."
    : "No data.";

  return (
    <ChartFigure
      label="Model comparison chart"
      summary={summary}
      height={compact ? 300 : 400}
      caption={
        bandModels.length
          ? "Shaded bands: prediction intervals of the highlighted models."
          : "Lines show point forecasts; enable intervals to see their uncertainty."
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: compact ? 8 : 16, bottom: 0, left: compact ? -8 : 0 }}>
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
            content={<ChartTooltip models={models} unit={unit} getRow={comparisonRow} />}
          />
          {bandModels.filter((m) => models.includes(m)).map((model) => (
            <Area
              key={`${model}-band`}
              type="monotone"
              dataKey={`${model}_band`}
              stroke="none"
              fill={getModelColor(model)}
              fillOpacity={0.1}
              isAnimationActive={false}
              activeDot={false}
            />
          ))}
          {models.map((model) => (
            <Line
              key={model}
              type="monotone"
              dataKey={model}
              name={getModelDisplayName(model)}
              stroke={getModelColor(model)}
              strokeWidth={2.25}
              dot={(props) => <MarkerDot key={`${model}-${props.index}`} model={model} cx={props.cx} cy={props.cy} />}
              activeDot={{ r: 5, stroke: getModelColor(model), fill: "#fff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}

export default memo(ComparisonChart);
