import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Box, Typography } from "@mui/material";

export default function ComparisonChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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


  const models = [...new Set(data.map((item) => item.model))];

  const defaultColors = {
    Prophet: "#4285F4",
    "Random Forest": "#000",        
    XGBoost: "#EA4335",
  };



  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
          <XAxis
            dataKey="year"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickCount={10}
            interval="preserveStartEnd"
            tickFormatter={(value) => value}
            label={{ value: "Year", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{
              value: "Forecast",
              angle: -90,
              position: "insideLeft",
              offset: -10,
            }}
          />
          <Tooltip
            formatter={(value) => (value != null ? value.toFixed(1) : "—")}
            labelFormatter={(label) => `Year ${label}`}
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
          />

          {models.map((modelName) => {
            const modelColor =
              data.find((d) => d.model === modelName)?.color ||
              defaultColors[modelName] ||
              "#8884d8";

            return (
              <Line
                key={modelName}
                type="monotone"
                dataKey="forecast"
                data={data.filter((d) => d.model === modelName)}
                name={modelName}
                stroke={modelColor}
                strokeWidth={2.2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                connectNulls
              />
            );
          })}

          {models.includes("Prophet") && (
            <>
              <Line
                type="monotone"
                dataKey="lower"
                data={data.filter((d) => d.model === "Prophet")}
                name="Prophet - Lower"
                stroke="#4285F4"
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey="upper"
                data={data.filter((d) => d.model === "Prophet")}
                name="Prophet - Upper"
                stroke="#4285F4"
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
                legendType="none"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}