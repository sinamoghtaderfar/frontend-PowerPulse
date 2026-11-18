import { useState } from "react";
import { Alert, Box, Container, Typography } from "@mui/material";

import { useForecastData } from "../hooks/useForecastData";
import { hasAnyForecast } from "../utils/forecastTransforms";
import ForecastHeader from "../components/Forecast/ForecastHeader";
import SingleModelView from "../components/Forecast/SingleModelView";
import ComparisonView from "../components/Forecast/ComparisonView";
import ForecastLoading from "../components/Forecast/ForecastLoading";
import ForecastError from "../components/Forecast/ForecastError";

export default function Forecast() {
  const { data, loading, error, refresh } = useForecastData();

  const [selectedModel, setSelectedModel] = useState("prophet");
  const [showComparison, setShowComparison] = useState(false);
  const [viewType, setViewType] = useState("both");

  if (loading) return <ForecastLoading />;
  if (error) return <ForecastError message={error} onRetry={refresh} />;

  return (
    <Container maxWidth="xl" sx={{ mt: "80px", mb: 4 }}>
      <ForecastHeader
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        showComparison={showComparison}
        onToggleComparison={() => setShowComparison((prev) => !prev)}
        viewType={viewType}
        onViewChange={setViewType}
      />

      {!hasAnyForecast(data) ? (
        <Alert severity="info">No forecast data is currently available.</Alert>
      ) : showComparison ? (
        <ComparisonView data={data} />
      ) : (
        <SingleModelView data={data} selectedModel={selectedModel} viewType={viewType} />
      )}

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Forecasts are based on historical data • Confidence intervals at 95%
        </Typography>
      </Box>
    </Container>
  );
}
