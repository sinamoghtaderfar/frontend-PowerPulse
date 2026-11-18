import {
  Paper,
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { BarChart, CompareArrows, TableChart } from "@mui/icons-material";

import { useMemo } from "react";
import ComparisonChart from "./ComparisonChart";
import ModelLegend from "./ModelLegend";
import {
  FORECAST_UNIT,
  MODEL_KEYS,
  getModelColor,
  getModelDisplayName,
} from "../../constants/models";
import { toComparisonRows } from "../../utils/forecastTransforms";
import { formatInterval, formatValue } from "../../utils/format";

export default function ComparisonView({ data }) {
  const rows = useMemo(() => toComparisonRows(data), [data]);
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.secondary.main}08 0%, ${theme.palette.secondary.light}04 100%)`,
        border: (theme) => `1px solid ${theme.palette.secondary.main}20`
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <BarChart color="secondary" />
        <Typography variant="h5" component="h2" fontWeight={700}>
          Model Comparison
        </Typography>
        <Chip label="All Models" color="secondary" size="small" variant="outlined" />
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CompareArrows /> Combined Forecast Chart
        </Typography>
        <Box sx={{ height: { xs: 340, md: 460 }, mt: 2 }}>
          <ComparisonChart data={rows} />
        </Box>

        <ModelLegend />
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2, maxHeight: 500, overflow: "auto" }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <TableChart /> Comparison Table
        </Typography>

        <TableContainer>
          <Table size="small" stickyHeader aria-label="Forecast comparison by year and model">
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
                {MODEL_KEYS.map((model) => (
                  <TableCell
                    key={model}
                    align="center"
                    sx={{
                      fontWeight: 700,
                      backgroundColor: (theme) => theme.palette.grey[100],
                      color: getModelColor(model)
                    }}
                  >
                    {getModelDisplayName(model)} ({FORECAST_UNIT})
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow
                  key={row.year}
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
                    {row.year}
                  </TableCell>
                  {MODEL_KEYS.map((model) => (
                    <TableCell key={model} align="center">
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatValue(row[model])}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatInterval(row[`${model}_lower`], row[`${model}_upper`])}
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
  );
} 