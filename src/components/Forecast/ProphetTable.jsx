import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";

export default function ProphetTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        No data available to display
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, backgroundColor: "grey.100" }}>
              Year
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, backgroundColor: "grey.100" }}>
              Forecast
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, backgroundColor: "grey.100" }}>
              Confidence Interval (Lower – Upper)
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} hover>
              <TableCell component="th" scope="row">
                {row.year || row.date || "—"}
              </TableCell>
              <TableCell align="right">
                {row.forecast != null ? row.forecast.toFixed(1) : "—"}
              </TableCell>
              <TableCell align="right">
                {row.lower != null && row.upper != null
                  ? `(${row.lower.toFixed(1)} – ${row.upper.toFixed(1)})`
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
