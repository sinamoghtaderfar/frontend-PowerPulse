import { Box, Stack, Typography } from "@mui/material";
import { MODEL_KEYS } from "../../constants/models";

/**
 * Explains interval semantics using the API's own metadata
 * (`metadata.units.uncertainty`, `metadata.intervals`).
 */
export default function IntervalNote({ metadata, model }) {
  const models = model ? [model] : MODEL_KEYS;
  const horizons = models
    .map((m) => metadata.intervals[m]?.maxCalibratedHorizon)
    .filter((h) => Number.isInteger(h));
  const maxHorizon = horizons.length ? Math.min(...horizons) : null;
  const coverage = models.map((m) => metadata.intervals[m]?.nominalCoverage).find(Boolean);

  // The API text points to its README; the same details are on the Methodology page.
  const apiDescription = metadata.units.uncertainty?.replace(/\s*\(see README\)/i, "");
  const items = [
    "Values are annual electricity generation in TWh (not consumption). Historical observations are not provided by the API, so charts show forecast years only.",
    apiDescription
      ? `Intervals, as described by the API: ${apiDescription}.`
      : coverage
        ? `Shaded ranges are empirical prediction intervals targeting ${Math.round(coverage * 100)} % coverage.`
        : "Shaded ranges are empirical prediction intervals.",
    "Treat intervals as indicative ranges rather than guaranteed bounds; the Methodology page explains how they were evaluated.",
    maxHorizon !== null
      ? `Intervals are only available up to ${maxHorizon} years ahead; later years show the point forecast only.`
      : null,
  ].filter(Boolean);

  return (
    <Stack spacing={1.25} component="ul" sx={{ m: 0, pl: 0, listStyle: "none" }}>
      {items.map((text) => (
        <Box component="li" key={text} sx={{ display: "flex", gap: 1.25 }}>
          <Box aria-hidden sx={{ width: 6, height: 6, mt: 1, borderRadius: "50%", bgcolor: "secondary.main", flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary">
            {text}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
