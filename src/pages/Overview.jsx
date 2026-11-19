import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Card, CardActionArea, Grid, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PageHeader from "../components/common/PageHeader";
import Section from "../components/common/Section";
import StatCard from "../components/common/StatCard";
import ModelDot from "../components/common/ModelDot";
import HorizonControl from "../components/forecast/HorizonControl";
import ForecastGate from "../components/forecast/ForecastGate";
import ComparisonChart from "../components/charts/ComparisonChart";
import IntervalNote from "../components/forecast/IntervalNote";
import {
  FORECAST_UNIT,
  MODEL_DESCRIPTIONS,
  MODEL_SLUGS,
  REGION_LABEL,
  getModelColor,
  getModelDisplayName,
} from "../constants/models";
import { availableModels, modelSpread, toComparisonRows } from "../utils/forecastTransforms";
import { formatPercent, formatValue } from "../utils/format";
import { usePageTitle } from "../hooks/usePageTitle";

function OverviewContent({ view }) {
  const { forecasts, summaries, metadata } = view;
  const unit = metadata.units.forecast ?? FORECAST_UNIT;
  const models = availableModels(forecasts);
  const rows = useMemo(() => toComparisonRows(forecasts), [forecasts]);
  const spread = useMemo(() => modelSpread(rows), [rows]);
  const lastSpread = spread.at(-1);

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {models.map((model) => {
          const s = summaries[model];
          const last = forecasts[model].at(-1);
          return (
            <Grid key={model} size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label={`${getModelDisplayName(model)} · ${last.year}`}
                value={formatValue(last.forecast)}
                unit={unit}
                accent={getModelColor(model)}
                caption={
                  s?.avgAnnualGrowth != null
                    ? `${formatPercent(s.avgAnnualGrowth)} per year (CAGR, ${s.period})`
                    : `Forecast for ${last.year}`
                }
              />
            </Grid>
          );
        })}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label={lastSpread ? `Model spread · ${lastSpread.year}` : "Model spread"}
            value={lastSpread ? formatValue(lastSpread.range) : "—"}
            unit={unit}
            caption={
              lastSpread
                ? `Lowest ${formatValue(lastSpread.min)} – highest ${formatValue(lastSpread.max)} ${unit}`
                : "Needs at least two models"
            }
          />
        </Grid>
      </Grid>

      <Section
        id="overview-chart"
        title="Forecast by model"
        description={`Annual electricity generation, ${REGION_LABEL}. All values are model forecasts.`}
        actions={
          <Button component={RouterLink} to="/compare" endIcon={<ArrowForwardRoundedIcon />} size="small">
            Compare in detail
          </Button>
        }
      >
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", mb: 2 }}>
          {models.map((model) => (
            <Box key={model} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
              <ModelDot model={model} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {getModelDisplayName(model)}
              </Typography>
            </Box>
          ))}
        </Stack>
        <ComparisonChart rows={rows} models={models} unit={unit} />
      </Section>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Section id="overview-intervals" title="How to read these forecasts" sx={{ height: "100%" }}>
            <IntervalNote metadata={metadata} />
          </Section>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Section id="overview-models" title="Explore a model" sx={{ height: "100%" }}>
            <Stack spacing={1.5}>
              {models.map((model) => (
                <Card key={model}>
                  <CardActionArea
                    component={RouterLink}
                    to={`/forecast?model=${MODEL_SLUGS[model]}`}
                    sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <ModelDot model={model} size={12} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" component="p">
                        {getModelDisplayName(model)}
                      </Typography>
                      <Typography variant="caption" component="p">
                        {MODEL_DESCRIPTIONS[model]}
                      </Typography>
                    </Box>
                    <ArrowForwardRoundedIcon aria-hidden sx={{ color: "text.secondary" }} />
                  </CardActionArea>
                </Card>
              ))}
            </Stack>
          </Section>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default function Overview() {
  usePageTitle("Overview");
  return (
    <>
      <PageHeader
        eyebrow={`${REGION_LABEL} · annual electricity generation`}
        title="Generation outlook"
        description="Forecasts of Germany's annual electricity generation from three models served by the PowerPulse API."
        actions={<HorizonControl />}
      />
      <ForecastGate>{(view) => <OverviewContent view={view} />}</ForecastGate>
    </>
  );
}
