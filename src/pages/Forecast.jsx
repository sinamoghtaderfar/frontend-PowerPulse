// src/components/Forecast/ForecastProphet.jsx
import { useState } from "react";
import { Container, Box, Typography } from "@mui/material";

import { useForecastData } from "../hooks/useForecastData";
import ForecastHeader from "../components/Forecast/ForecastHeader";
import SingleModelView from "../components/Forecast/SingleModelView";
import ComparisonView from "../components/Forecast/ComparisonView";
import ForecastLoading from "../components/Forecast/ForecastLoading";
import ForecastError from "../components/Forecast/ForecastError";

export default function ForecastProphet() {
  const { data, loading, error, refresh } = useForecastData();

  // states
  const [selectedModel, setSelectedModel] = useState("prophet");
  const [showComparison, setShowComparison] = useState(false);
  const [viewType, setViewType] = useState("both"); // ← این state مهم است

  if (loading) return <ForecastLoading />;
  if (error) return <ForecastError message={error} onRetry={refresh} />;

  return (
    <Container maxWidth="xl" sx={{ mt: "80px", mb: 4 }}>
      {/* Header */}
      <ForecastHeader
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        showComparison={showComparison}
        onToggleComparison={() => setShowComparison((prev) => !prev)}
        viewType={viewType}           // ← اضافه شد
        onViewChange={setViewType}    // ← اضافه شد
      />

      {/* Main View */}
      {showComparison ? (
        <ComparisonView data={data} />
      ) : (
        <SingleModelView
          data={data}
          selectedModel={selectedModel}
          viewType={viewType}         // ← اضافه شد
        />
      )}

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Forecasts are based on historical data • Confidence intervals at 95%
        </Typography>
      </Box>
    </Container>
  );
}
