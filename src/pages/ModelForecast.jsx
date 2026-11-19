import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Grid, Stack, Typography } from "@mui/material";
import PageHeader from "../components/common/PageHeader";
import Section from "../components/common/Section";
import StatCard from "../components/common/StatCard";
import HorizonControl from "../components/forecast/HorizonControl";
import ModelSelector from "../components/forecast/ModelSelector";
import ForecastGate from "../components/forecast/ForecastGate";
import IntervalNote from "../components/forecast/IntervalNote";
import ForecastBandChart from "../components/charts/ForecastBandChart";
import ForecastTable from "../components/tables/ForecastTable";
import { EmptyState } from "../components/common/StateViews";
import {
  FORECAST_UNIT,
  MODEL_DESCRIPTIONS,
  MODEL_SLUGS,
  getModelColor,
  getModelDisplayName,
  modelFromSlug,
} from "../constants/models";
import { formatInterval, formatPercent, formatValue } from "../utils/format";
import { useForecast } from "../context/ForecastContext";
import { usePageTitle } from "../hooks/usePageTitle";

function ModelContent({ view, model }) {
  const { forecasts, summaries, metadata } = view;
  const unit = metadata.units.forecast ?? FORECAST_UNIT;
  const rows = forecasts[model];
  const summary = summaries[model];
  const name = getModelDisplayName(model);
  const caption = useMemo(() => `${name} forecast values by year`, [name]);

  if (!rows.length) {
    return (
      <EmptyState
        title={`${name} is currently unavailable`}
        description="The API did not return a forecast for this model. Choose another model or try again later."
      />
    );
  }
  const first = rows[0];
  const last = rows.at(-1);
  const info = metadata.intervals[model];

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label={`Forecast ${first.year}`}
            value={formatValue(first.forecast)}
            unit={unit}
            accent={getModelColor(model)}
            caption={`Interval ${formatInterval(first.lower, first.upper)}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label={`Forecast ${last.year}`}
            value={formatValue(last.forecast)}
            unit={unit}
            caption={`Interval ${formatInterval(last.lower, last.upper)}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total change"
            value={formatPercent(summary?.totalGrowthPercent)}
            caption={
              summary?.growthPeriods
                ? `${summary.period}, over ${summary.growthPeriods} ${summary.growthPeriods === 1 ? "year" : "years"}`
                : "Needs a horizon of at least 2 years"
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Average annual growth"
            value={formatPercent(summary?.avgAnnualGrowth)}
            caption="Compound annual growth rate (CAGR)"
          />
        </Grid>
      </Grid>

      <Section id="model-chart" title={`${name} forecast`} description={`Electricity generation in ${unit}`}>
        <ForecastBandChart model={model} rows={rows} unit={unit} />
      </Section>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Section id="model-table" title="Year-by-year values">
            <ForecastTable rows={rows} unit={unit} caption={caption} />
          </Section>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Section id="model-about" title={`About ${name}`} sx={{ height: "100%" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {MODEL_DESCRIPTIONS[model]}
            </Typography>
            {info?.method && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Interval method: {info.method}.
              </Typography>
            )}
            <IntervalNote metadata={metadata} model={model} />
          </Section>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default function ModelForecast() {
  const [params, setParams] = useSearchParams();
  const model = modelFromSlug(params.get("model")) ?? "prophet";
  const { data } = useForecast();
  usePageTitle(`${getModelDisplayName(model)} forecast`);

  const selectModel = (next) => setParams({ model: MODEL_SLUGS[next] }, { replace: true });

  return (
    <>
      <PageHeader
        eyebrow="Model forecasts"
        title={`${getModelDisplayName(model)} forecast`}
        description="Point forecast, prediction interval and year-by-year values for a single model."
        actions={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}>
            <ModelSelector
              value={model}
              onChange={selectModel}
              unavailable={data?.metadata.unavailableModels ?? []}
            />
            <HorizonControl />
          </Stack>
        }
      />
      <ForecastGate>{(view) => <ModelContent view={view} model={model} />}</ForecastGate>
    </>
  );
}
