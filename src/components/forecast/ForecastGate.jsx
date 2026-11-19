import { Alert, Box, LinearProgress } from "@mui/material";
import { useForecast } from "../../context/ForecastContext";
import { EmptyState, ErrorState, LoadingState } from "../common/StateViews";
import { getModelDisplayName } from "../../constants/models";
import { hasAnyForecast } from "../../utils/forecastTransforms";

/**
 * Handles loading / error / empty states for pages that show forecasts.
 * While a new horizon loads, the previous result stays visible (dimmed) and
 * is passed to `children` with `updating: true`.
 */
export default function ForecastGate({ children }) {
  const { data, previousData, loading, error, refresh } = useForecast();

  if (error) return <ErrorState message={error} onRetry={refresh} />;
  const view = data ?? previousData;
  if (!view) return <LoadingState />;
  if (!hasAnyForecast(view.forecasts)) {
    return (
      <EmptyState
        title="No forecast data available"
        description="The API responded without any forecast rows. Try again in a moment."
        action={null}
      />
    );
  }

  const unavailable = view.metadata.unavailableModels;
  return (
    <Box aria-busy={loading}>
      {loading && (
        <LinearProgress aria-label="Updating forecasts" sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1300 }} />
      )}
      {unavailable.length > 0 && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 3, bgcolor: "background.paper" }}>
          {unavailable.map(getModelDisplayName).join(", ")}{" "}
          {unavailable.length === 1 ? "is" : "are"} currently unavailable on the API. The remaining models are shown.
        </Alert>
      )}
      <Box sx={{ opacity: loading ? 0.6 : 1, transition: "opacity 150ms ease" }}>
        {children(view, { updating: loading })}
      </Box>
    </Box>
  );
}
