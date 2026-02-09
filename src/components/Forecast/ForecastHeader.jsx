import {
  Box,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  alpha
} from "@mui/material";
import {
  TrendingUp,
  InfoOutlined,
  CompareArrows,
  ShowChart,
  TableChart
} from "@mui/icons-material";

export default function ForecastHeader({
  selectedModel,
  onModelChange,
  showComparison,
  onToggleComparison,
  viewType,          
  onViewChange        
}) {
  const models = ["prophet", "random_forest", "xgboost"];
  const getModelDisplayName = (model) => {
    const names = {
      prophet: "Prophet",
      random_forest: "Random Forest",
      xgboost: "XGBoost"
    };
    return names[model] || model;
  };
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        textAlign: "center",
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(
            theme.palette.primary.light,
            0.05
          )} 100%)`,
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
          onChange={(e, newValue) => newValue !== null && onModelChange(newValue)}
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
          onClick={onToggleComparison}
          size="small"
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          {showComparison ? "Hide Comparison" : "Compare All Models"}
        </Button>
      </Box>

      {!showComparison && (
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={(e, newView) => {
            if (newView !== null) {
              onViewChange(newView);
            }
          }}
          size="small"
        >
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
  );
}