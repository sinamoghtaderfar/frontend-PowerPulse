import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useForecast } from "../../context/ForecastContext";
import { HORIZON_OPTIONS } from "../../constants/horizons";

/** Forecast horizon selector (years ahead), shared by all pages. */
export default function HorizonControl() {
  const { yearsAhead, setYearsAhead, loading } = useForecast();

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
      <Typography id="horizon-label" variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        Horizon
      </Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={yearsAhead}
        aria-labelledby="horizon-label"
        onChange={(_, value) => value !== null && setYearsAhead(value)}
        sx={{ bgcolor: "background.paper", flexWrap: "wrap" }}
      >
        {HORIZON_OPTIONS.map((years) => (
          <ToggleButton
            key={years}
            value={years}
            aria-label={`${years} years ahead`}
            disabled={loading && years !== yearsAhead}
            sx={{ minWidth: 52 }}
          >
            {years} yrs
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}
