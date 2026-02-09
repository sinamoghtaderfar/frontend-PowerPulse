import { useState } from "react";
import { Container, Box, Typography } from "@mui/material";

import { useForecastData } from "./useForecastData";
import ForecastHeader from "./ForecastHeader";
import SingleModelView from "./SingleModelView";
import ComparisonView from "./ComparisonView";
import ForecastLoading from "./ForecastLoading";
import ForecastError from "./ForecastError";

export default function ForecastProphet() {
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

      {showComparison ? (
        <ComparisonView data={data} />
      ) : (
        <SingleModelView
          data={data}
          selectedModel={selectedModel}
          viewType={viewType}       
        />
      )}

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Forecasts are based on historical data • Confidence intervals at 95%
        </Typography>
      </Box>
    </Container>
  );
}