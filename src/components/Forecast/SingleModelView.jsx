import { Box, Grid, Paper, Typography } from "@mui/material";
import ForecastChart from "./ForecastChart";
import ForecastTable from "./ForecastTable";
import { getModelDisplayName } from "../../constants/models";

export default function SingleModelView({ data, selectedModel, viewType }) {
  const rows = data?.[selectedModel] ?? [];
  const showChart = viewType === "chart" || viewType === "both";
  const showTable = viewType === "table" || viewType === "both";
  const half = showChart && showTable;

  return (
    <Grid container spacing={4} justifyContent="center">
      {showChart && (
        <Grid size={{ xs: 12, lg: half ? 6 : 12 }}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" component="h2" fontWeight={600} gutterBottom>
              {getModelDisplayName(selectedModel)} Forecast
            </Typography>
            <Box sx={{ width: "100%", height: { xs: 320, md: 420 } }}>
              <ForecastChart data={rows} />
            </Box>
          </Paper>
        </Grid>
      )}

      {showTable && (
        <Grid size={{ xs: 12, lg: half ? 6 : 12 }}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" component="h2" fontWeight={600} gutterBottom>
              Forecast Data Table
            </Typography>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <ForecastTable data={rows} />
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}
