import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Typography } from "@mui/material";
import {
  FORECAST_LABEL,
  MODEL_KEYS,
  getModelColor,
  getModelDisplayName,
} from "../../constants/models";
import { formatValue } from "../../utils/format";

/** `data`: rows from `toComparisonRows` (one row per year, one column per model). */
export default function ComparisonChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "grid",
          placeItems: "center",
          bgcolor: "grey.100",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No data available for comparison
        </Typography>
      </Box>
    );
  }

  const prophetColor = getModelColor("prophet");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
        <XAxis
          dataKey="year"
          type="number"
          domain={["dataMin", "dataMax"]}
          allowDecimals={false}
          label={{ value: "Year", position: "insideBottom", offset: -10 }}
        />
        <YAxis
          domain={["auto", "auto"]}
          tickFormatter={(value) => Math.round(value)}
          width={70}
          label={{ value: FORECAST_LABEL, angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
        />
        <Tooltip
          formatter={(value) => formatValue(value)}
          labelFormatter={(label) => `Year ${label}`}
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
        />

        {MODEL_KEYS.map((model) => (
          <Line
            key={model}
            type="monotone"
            dataKey={model}
            name={getModelDisplayName(model)}
            stroke={getModelColor(model)}
            strokeWidth={2.2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
            connectNulls
          />
        ))}

        <Line
          type="monotone"
          dataKey="prophet_lower"
          name="Prophet - Lower"
          stroke={prophetColor}
          strokeDasharray="5 5"
          dot={false}
          activeDot={false}
          legendType="none"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="prophet_upper"
          name="Prophet - Upper"
          stroke={prophetColor}
          strokeDasharray="5 5"
          dot={false}
          activeDot={false}
          legendType="none"
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
