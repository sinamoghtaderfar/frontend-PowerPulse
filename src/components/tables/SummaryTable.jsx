import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import ModelDot from "../common/ModelDot";
import { FORECAST_UNIT, getModelDisplayName } from "../../constants/models";
import { formatPercent, formatValue } from "../../utils/format";

/** Backend growth summaries (`summaries` of `/forecast/all`) per model. */
export default function SummaryTable({ summaries, models, unit = FORECAST_UNIT }) {
  return (
    <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1.5 }}>
      <Table size="small" aria-label="Forecast summary by model" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell>Model</TableCell>
            <TableCell>Period</TableCell>
            <TableCell align="right">Start ({unit})</TableCell>
            <TableCell align="right">End ({unit})</TableCell>
            <TableCell align="right">Total change</TableCell>
            <TableCell align="right">CAGR</TableCell>
            <TableCell align="right">Avg. interval width ({unit})</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {models.map((model) => {
            const s = summaries?.[model];
            return (
              <TableRow key={model} hover>
                <TableCell component="th" scope="row">
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, fontWeight: 600 }}>
                    <ModelDot model={model} />
                    {getModelDisplayName(model)}
                  </Box>
                </TableCell>
                <TableCell>{s?.period ?? "—"}</TableCell>
                <TableCell align="right">{formatValue(s?.startValue)}</TableCell>
                <TableCell align="right">{formatValue(s?.endValue)}</TableCell>
                <TableCell align="right">{formatPercent(s?.totalGrowthPercent)}</TableCell>
                <TableCell align="right">{formatPercent(s?.avgAnnualGrowth)}</TableCell>
                <TableCell align="right">{formatValue(s?.avgUncertaintyWidth)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
