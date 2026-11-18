import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { FORECAST_UNIT } from "../../constants/models";
import { formatInterval, formatValue } from "../../utils/format";

const headerSx = { fontWeight: 700, backgroundColor: "grey.100" };

export default function ForecastTable({ data = [] }) {
  if (data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        No data available to display
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
      <Table stickyHeader size="small" aria-label="Forecast values by year">
        <TableHead>
          <TableRow>
            <TableCell sx={headerSx}>Year</TableCell>
            <TableCell align="right" sx={headerSx}>
              Forecast ({FORECAST_UNIT})
            </TableCell>
            <TableCell align="right" sx={headerSx}>
              95% Confidence Interval (Lower – Upper)
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.year} hover>
              <TableCell component="th" scope="row">
                {row.year}
              </TableCell>
              <TableCell align="right">{formatValue(row.forecast)}</TableCell>
              <TableCell align="right">{formatInterval(row.lower, row.upper)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
