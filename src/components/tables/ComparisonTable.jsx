import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import ModelDot from "../common/ModelDot";
import { FORECAST_UNIT, getModelDisplayName } from "../../constants/models";
import { formatInterval, formatValue } from "../../utils/format";

/** Year × model table; first column stays visible when scrolling horizontally. */
export default function ComparisonTable({ rows, models, unit = FORECAST_UNIT }) {
  return (
    <TableContainer sx={{ maxHeight: 480, border: 1, borderColor: "divider", borderRadius: 1.5 }}>
      <Table stickyHeader size="small" aria-label="Forecast comparison by year and model" sx={{ minWidth: 560 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ position: "sticky", left: 0, zIndex: 3 }}>Year</TableCell>
            {models.map((model) => (
              <TableCell key={model} align="right">
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                  <ModelDot model={model} size={8} />
                  {getModelDisplayName(model)} ({unit})
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.year} hover>
              <TableCell
                component="th"
                scope="row"
                sx={{ position: "sticky", left: 0, bgcolor: "background.paper", fontWeight: 600, zIndex: 1 }}
              >
                {row.year}
              </TableCell>
              {models.map((model) => (
                <TableCell key={model} align="right">
                  <Typography variant="body2" className="tabular-nums" sx={{ fontWeight: 600 }}>
                    {formatValue(row[model])}
                  </Typography>
                  <Typography variant="caption" className="tabular-nums" component="span" sx={{ whiteSpace: "nowrap" }}>
                    {formatInterval(row[`${model}_lower`], row[`${model}_upper`])}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
