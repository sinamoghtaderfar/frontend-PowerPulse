import { Grid, Paper, Typography, Box } from "@mui/material";
import ProphetChart from "./ProphetChart";
import ProphetTable from "./ProphetTable";

import { useSingleModelData, useModelHelpers } from "./forecastDataTransformers";

export default function SingleModelView({ data, selectedModel, viewType }) {
  const { getModelDisplayName } = useModelHelpers();
  const chartData = useSingleModelData(data, selectedModel);

  const showChart = viewType === "chart" || viewType === "both";
  const showTable = viewType === "table" || viewType === "both";

  return (
    <Grid container spacing={4} justifyContent="center">
      {showChart && (
        <Grid item xs={12} lg={showTable ? 6 : 12}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, maxHeight: 500, overflow: "hidden" }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {selectedModel === "random_forest"
                ? "Random Forecast"
                : getModelDisplayName(selectedModel) + " Forecast"}
            </Typography>
            <Box sx={{ width: "100%", height: 420, minWidth: 600, overflow: "hidden" }}>
              <ProphetChart data={chartData} />
            </Box>
          </Paper>
        </Grid>
      )}

      {showTable && (
        <Grid item xs={12} lg={showChart ? 6 : 12}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, overflow: "auto", maxHeight: 500 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Forecast Data Table
            </Typography>
            <Box sx={{ width: "100%", height: 420, minWidth: 600, overflow: "hidden" }}>
              <ProphetTable data={chartData} />
            </Box>

          </Paper>
        </Grid>
      )}
    </Grid>
  );
}