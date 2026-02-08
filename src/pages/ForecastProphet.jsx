import { useEffect, useState, useCallback, useMemo } from "react";
import { getAllForecasts } from "../api/energyApi";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Container,
  Grid,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
  alpha,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import {
  Timeline,
  TrendingUp,
  ErrorOutline,
  Refresh,
  TableChart,
  ShowChart,
  InfoOutlined,
  Download,
  Fullscreen,
  CompareArrows,
  BarChart
} from "@mui/icons-material";
import ProphetChart from "../components/Prophet Forecast/ProphetChart";
import ProphetTable from "../components/Prophet Forecast/ProphetTable";
import ComparisonChart from "../components/Prophet Forecast/ComparisonChart";



function ForecastProphet() {
  const [data, setData] = useState({
    prophet: [],
    random_forest: [],
    xgboost: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState("prophet");
  const [viewType, setViewType] = useState("both");
  const [refreshCount, setRefreshCount] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const getModelDisplayName = (model) => {
    const names = {
      prophet: "Prophet",
      random_forest: "Random Forest",
      xgboost: "XGBoost"
    };
    return names[model] || model;
  };

  const getModelColor = (model) => {
    const colors = {
      prophet: "#4285F4",    // آبی
      random_forest: "#34A853", // سبز
      xgboost: "#EA4335"     // قرمز
    };
    return colors[model] || "#000000";
  };

  const models = ["prophet", "random_forest", "xgboost"];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allForecasts = await getAllForecasts(10);
      setData(allForecasts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forecast data");
      console.error("Error fetching forecasts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshCount]);

  const handleRefresh = () => setRefreshCount((prev) => prev + 1);

  const handleModelChange = (event, newModel) => {
    if (newModel !== null) setSelectedModel(newModel);
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) setViewType(newView);
  };

  const toggleComparison = () => {
    setShowComparison((prev) => !prev);
  };

  const prophetChartData = useMemo(() => {
    const modelData = data[selectedModel] || [];
    return modelData.map((item) => ({
      year: item?.year ?? 0,
      forecast: item?.forecast ?? null,
      lower: item?.lower ?? null,
      upper: item?.upper ?? null,
      model: getModelDisplayName(selectedModel)
    }));
  }, [data, selectedModel]);

  const prophetTableData = useMemo(() => {
    const modelData = data[selectedModel] || [];
    return modelData.map((item) => ({
      date: String(item.year || ""),
      value: item.forecast ? Number(item.forecast.toFixed(1)) : null,
      lower: item.lower ? Number(item.lower.toFixed(1)) : null,
      upper: item.upper ? Number(item.upper.toFixed(1)) : null,
      model: getModelDisplayName(selectedModel)
    }));
  }, [data, selectedModel]);

  const combinedChartData = useMemo(() => {
    const combined = [];
    models.forEach((model) => {
      const modelData = data[model] || [];
      modelData.forEach((item) => {
        combined.push({
          year: item?.year ?? 0,
          forecast: item?.forecast ?? null,
          lower: item?.lower ?? null,
          upper: item?.upper ?? null,
          model: getModelDisplayName(model),
          color: getModelColor(model)
        });
      });
    });
    return combined;
  }, [data]);

  const comparisonTableData = useMemo(() => {
    const tableData = [];
    const years = [...new Set(combinedChartData.map((item) => item.year))].sort((a, b) => a - b);
    years.forEach((year) => {
      const row = { date: String(year) };
      models.forEach((model) => {
        const modelDisplayName = getModelDisplayName(model);
        const dataPoint = combinedChartData.find(
          (item) => item.year === year && item.model === modelDisplayName
        );
        row[`${model}_forecast`] = dataPoint?.forecast ? Number(dataPoint.forecast.toFixed(1)) : null;
        row[`${model}_lower`] = dataPoint?.lower ? Number(dataPoint.lower.toFixed(1)) : null;
        row[`${model}_upper`] = dataPoint?.upper ? Number(dataPoint.upper.toFixed(1)) : null;
      });
      tableData.push(row);
    });
    return tableData;
  }, [combinedChartData]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            gap: 3
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: "primary.main", animationDuration: "800ms" }} />
          <Typography variant="h6" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Timeline /> Loading forecast data...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 2, boxShadow: 1, "& .MuiAlert-icon": { fontSize: 32 } }}
          action={
            <IconButton color="inherit" size="small" onClick={handleRefresh} sx={{ ml: 1 }}>
              <Refresh />
            </IconButton>
          }
        >
          <Typography variant="h6" gutterBottom>
            <ErrorOutline sx={{ verticalAlign: "middle", mr: 1 }} />
            Unable to Load Data
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: "80px", mb: 4 }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          textAlign: "center",
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}
      >
        <TrendingUp fontSize="large" color="primary" sx={{ mb: 1 }} />
        <Typography
          variant="h4"
          sx={{
            mb: 1,
            fontWeight: 700,
            background: (theme) =>
              `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          }}
        >
          Energy Forecast Dashboard
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          <InfoOutlined fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
          Predictive analytics for future energy consumption
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <ToggleButtonGroup
            value={selectedModel}
            exclusive
            onChange={handleModelChange}
            size="small"
            disabled={showComparison}
          >
            {models.map((model) => (
              <ToggleButton key={model} value={model}>
                {getModelDisplayName(model)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Button
            variant={showComparison ? "contained" : "outlined"}
            color={showComparison ? "secondary" : "primary"}
            startIcon={<CompareArrows />}
            onClick={toggleComparison}
            size="small"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {showComparison ? "Hide Comparison" : "Compare All Models"}
          </Button>
        </Box>

        {!showComparison && (
          <ToggleButtonGroup value={viewType} exclusive onChange={handleViewChange} size="small">
            <ToggleButton value="chart">
              <ShowChart sx={{ mr: 1 }} />
              Chart
            </ToggleButton>
            <ToggleButton value="table">
              <TableChart sx={{ mr: 1 }} />
              Table
            </ToggleButton>
            <ToggleButton value="both">Both</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Paper>

      {/* مقایسه - وقتی فعال است */}
      {showComparison && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.light, 0.04)} 100%)`,
            border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <BarChart color="secondary" />
            <Typography variant="h5" fontWeight={700}>
              Model Comparison
            </Typography>
            <Chip label="All Models" color="secondary" size="small" variant="outlined" />
          </Box>

          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CompareArrows /> Combined Forecast Chart
            </Typography>
            <Box sx={{ height: 460, mt: 2 }}>
              <ComparisonChart data={combinedChartData} />
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                mt: 3,
                pt: 2,
                borderTop: 1,
                borderColor: "divider",
                flexWrap: "wrap"
              }}
            >
              {models.map((model) => (
                <Box key={model} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "2px",
                      backgroundColor: getModelColor(model)
                    }}
                  />
                  <Typography variant="body2">{getModelDisplayName(model)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2, maxHeight: 500, overflow: "auto" }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <TableChart /> Comparison Table
            </Typography>

            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: (theme) => theme.palette.grey[100],
                        position: "sticky",
                        left: 0,
                        zIndex: 2
                      }}
                    >
                      Year
                    </TableCell>
                    {models.map((model) => (
                      <TableCell
                        key={model}
                        align="center"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: (theme) => theme.palette.grey[100],
                          color: getModelColor(model)
                        }}
                      >
                        {getModelDisplayName(model)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisonTableData.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: index % 2 === 0 ? "transparent" : (theme) => theme.palette.action.hover
                      }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          fontWeight: 600,
                          position: "sticky",
                          left: 0,
                          backgroundColor: (theme) => theme.palette.background.paper,
                          zIndex: 1
                        }}
                      >
                        {row.date}
                      </TableCell>
                      {models.map((model) => (
                        <TableCell key={model} align="center">
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {row[`${model}_forecast`] ?? "N/A"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              [{row[`${model}_lower`] ?? "N/A"} – {row[`${model}_upper`] ?? "N/A"}]
                            </Typography>
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Paper>
      )}

      {/* بخش تک‌مدلی - فقط وقتی مقایسه خاموش است */}
      {!showComparison && (
        <Grid container spacing={4} justifyContent="center">
          {(viewType === "chart" || viewType === "both") && (
            <Grid item xs={12} lg={viewType === "both" ? 6 : 12}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  maxHeight: 500,
                  overflow: "hidden"
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {getModelDisplayName(selectedModel)} Forecast
                </Typography>

                <Box sx={{
                  width: "100%",
                  height: 420,
                  minWidth: 600, 
                  overflow: "hidden" 
                }}>
                  <ProphetChart data={prophetChartData} />
                </Box>
              </Paper>
            </Grid>

          )}

          {(viewType === "table" || viewType === "both") && (
            <Grid item xs={12} lg={viewType === "both" ? 6 : 12}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, overflow: "auto", maxHeight: 500 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Forecast Data Table
                </Typography>
                <ProphetTable data={prophetTableData} />
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Forecasts are based on historical data • Confidence intervals at 95%
        </Typography>
      </Box>
    </Container>
  );
}

export default ForecastProphet;