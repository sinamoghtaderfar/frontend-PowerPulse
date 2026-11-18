import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { FORECAST_LABEL } from "../../constants/models";
import { formatValue } from "../../utils/format";

export default function ForecastChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
        <Typography color="text.secondary">No forecast data available</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis
          domain={["auto", "auto"]}
          tickFormatter={(value) => Math.round(value)}
          width={70}
          label={{
            value: FORECAST_LABEL,
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle", fontWeight: 600, fill: "#555" },
          }}
        />
        <Tooltip formatter={(value) => formatValue(value)} labelFormatter={(y) => `Year ${y}`} />
        <Legend />
        <Line
          type="monotone"
          dataKey="lower"
          name="Lower Bound"
          stroke="#ef4444"
          strokeWidth={1.5}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecast"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="upper"
          name="Upper Bound"
          stroke="#3b82f6"
          strokeWidth={1.5}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
