import { Box, Typography } from "@mui/material";
import { visuallyHidden } from "../../utils/a11y";

/** Accessible figure wrapper: visible caption plus a screen-reader summary. */
export default function ChartFigure({ label, summary, caption, height, children }) {
  return (
    <Box component="figure" role="figure" aria-label={label} sx={{ m: 0 }}>
      <Box sx={{ width: "100%", height, minWidth: 0 }} aria-hidden="true">
        {children}
      </Box>
      <Box component="figcaption">
        {summary && <Box sx={visuallyHidden}>{summary}</Box>}
        {caption && (
          <Typography variant="caption" component="p" sx={{ mt: 1.5 }}>
            {caption}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
