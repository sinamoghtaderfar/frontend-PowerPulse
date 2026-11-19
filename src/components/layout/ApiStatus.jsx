import { Box, Tooltip, Typography } from "@mui/material";
import { useForecast } from "../../context/ForecastContext";
import { getModelDisplayName } from "../../constants/models";

const STATUS = {
  loading: { label: "Checking API", color: "#8A94A3" },
  healthy: { label: "API online", color: "#34C38F" },
  degraded: { label: "API degraded", color: "#E8A317" },
  offline: { label: "API offline", color: "#F06548" },
};

/** Live API status from `/health`. */
export default function ApiStatus() {
  const { health } = useForecast();
  const status = STATUS[health.status] ?? STATUS.loading;
  const down = health.models
    ? Object.entries(health.models)
        .filter(([, ok]) => !ok)
        .map(([model]) => getModelDisplayName(model))
    : [];
  const detail =
    health.status === "degraded" && down.length
      ? `Unavailable: ${down.join(", ")}`
      : health.status === "offline"
        ? "The forecasting API could not be reached."
        : health.apiVersion
          ? `API version ${health.apiVersion}`
          : status.label;

  return (
    <Tooltip title={detail}>
      <Box
        role="status"
        aria-label={`${status.label}. ${detail}`}
        tabIndex={0}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: 1.25,
          py: 0.5,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.14)",
          outline: "none",
          "&:focus-visible": { boxShadow: "0 0 0 2px rgba(232,163,23,0.8)" },
        }}
      >
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: status.color }} />
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>
          {status.label}
        </Typography>
      </Box>
    </Tooltip>
  );
}
