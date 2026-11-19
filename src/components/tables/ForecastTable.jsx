import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { FORECAST_UNIT } from "../../constants/models";
import { formatInterval, formatPercent, formatValue } from "../../utils/format";

const growth = (current, previous) =>
  previous > 0 && Number.isFinite(current) ? (current / previous - 1) * 100 : null;

/** Year-by-year table of one model's forecast. */
export default function ForecastTable({ rows, unit = FORECAST_UNIT, caption }) {
  return (
    <TableContainer sx={{ maxHeight: 440, border: 1, borderColor: "divider", borderRadius: 1.5 }}>
      <Table stickyHeader size="small" aria-label={caption ?? "Forecast values by year"}>
        <TableHead>
          <TableRow>
            <TableCell>Year</TableCell>
            <TableCell align="right">Forecast ({unit})</TableCell>
            <TableCell align="right">Interval ({unit})</TableCell>
            <TableCell align="right">Change vs. prior forecast year</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.year} hover>
              <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                {row.year}
              </TableCell>
              <TableCell align="right">{formatValue(row.forecast)}</TableCell>
              <TableCell align="right" sx={{ color: "text.secondary" }}>
                {formatInterval(row.lower, row.upper)}
              </TableCell>
              <TableCell align="right" sx={{ color: "text.secondary" }}>
                {index === 0 ? "—" : formatPercent(growth(row.forecast, rows[index - 1].forecast))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
