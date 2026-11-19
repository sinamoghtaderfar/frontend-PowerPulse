import { Box, Grid, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import PageHeader from "../components/common/PageHeader";
import Section from "../components/common/Section";
import ModelDot from "../components/common/ModelDot";
import { MODEL_DESCRIPTIONS, MODEL_KEYS, getModelDisplayName } from "../constants/models";
import { usePageTitle } from "../hooks/usePageTitle";

/**
 * Backtest results published in the API repository README
 * (`python -m app.evaluation`, API v1.1.0, data 1985–2025, origins 2000–2024).
 * Mean absolute error in TWh by forecast horizon (years ahead).
 */
const BACKTEST_MAE = [
  { name: "Persistence (last value)", values: [16.2, 33.8, 42.4, 46.7], baseline: true },
  { name: "Drift", values: [15.9, 33.3, 46.7, 62.1], baseline: true },
  { name: "Prophet", values: [20.3, 36.5, 49.6, 65.4] },
  { name: "Random Forest", values: [26.3, 41.9, 46.6, 53.9] },
  { name: "XGBoost", values: [18.5, 34.4, 42.5, 45.8] },
];
const HORIZONS = [1, 3, 5, 10];

function Paragraphs({ items }) {
  return (
    <Stack spacing={1.5}>
      {items.map((text) => (
        <Typography key={text} variant="body2" color="text.secondary">
          {text}
        </Typography>
      ))}
    </Stack>
  );
}

export default function Methodology() {
  usePageTitle("Methodology");
  return (
    <>
      <PageHeader
        eyebrow="Methodology"
        title="Data, models and limitations"
        description="What the forecasts are based on and how much they can be trusted."
      />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Section id="method-data" title="Data" sx={{ height: "100%" }}>
            <Paragraphs
              items={[
                "Target: Germany's annual total electricity generation in terawatt-hours (TWh) — not consumption or demand.",
                "Source: Our World in Data energy dataset, 1985–2025 (41 consecutive years), with population, GDP and the renewables share of primary energy as explanatory variables.",
                "GDP is missing in the source for 2023–2025 and the renewables share for 2025; the API carries the last observed value forward instead of inventing values.",
                "The API does not expose the historical series, so this app shows forecast years only.",
              ]}
            />
          </Section>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Section id="method-models" title="Models" sx={{ height: "100%" }}>
            <Stack spacing={2}>
              {MODEL_KEYS.map((model) => (
                <Box key={model} sx={{ display: "flex", gap: 1.5 }}>
                  <Box sx={{ pt: 0.75 }}>
                    <ModelDot model={model} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" component="h3">
                      {getModelDisplayName(model)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {MODEL_DESCRIPTIONS[model]}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Typography variant="body2" color="text.secondary">
                Future population, GDP and renewables share are projected with their compound growth over
                the last 10 observed years. These projections are assumptions, not data.
              </Typography>
            </Stack>
          </Section>
        </Grid>
        <Grid size={12}>
          <Section
            id="method-evaluation"
            title="Backtest accuracy"
            description="Mean absolute error (TWh) of recursive forecasts made from each year 2000–2024 with an expanding training window."
          >
            <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1.5 }}>
              <Table size="small" aria-label="Backtest mean absolute error by horizon" sx={{ minWidth: 520 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Method</TableCell>
                    {HORIZONS.map((h) => (
                      <TableCell key={h} align="right">
                        {h} {h === 1 ? "year" : "years"} ahead
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {BACKTEST_MAE.map((row) => (
                    <TableRow key={row.name} hover>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: row.baseline ? "text.secondary" : "text.primary" }}>
                        {row.name}
                        {row.baseline ? " · baseline" : ""}
                      </TableCell>
                      {row.values.map((v, i) => (
                        <TableCell key={HORIZONS[i]} align="right">
                          {v.toFixed(1)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              None of the models clearly beats simply repeating the last observed value; with 41 annual observations the
              differences are not statistically conclusive. Source: evaluation published in the{" "}
              <Link href="https://github.com/sinamoghtaderfar/api-Forecast-PowerPulse#evaluation" target="_blank" rel="noopener noreferrer">
                API repository
              </Link>{" "}
              (API v1.1.0).
            </Typography>
          </Section>
        </Grid>
        <Grid size={12}>
          <Section id="method-uncertainty" title="Prediction intervals">
            <Paragraphs
              items={[
                "Intervals come from the errors of past recursive forecasts at the same horizon (split-conformal method) and target 95 % coverage.",
                "When re-checked without look-ahead, the observed coverage was below 95 %, mainly because generation has fallen since 2018. Read the bands as indicative ranges.",
                "With too few past errors for longer horizons (beyond 11 years), the API returns no interval and only the point forecast is shown.",
              ]}
            />
          </Section>
        </Grid>
      </Grid>
    </>
  );
}
