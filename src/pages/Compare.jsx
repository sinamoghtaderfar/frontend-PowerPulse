import { useMemo, useState } from "react";
import { FormControlLabel, Stack, Switch } from "@mui/material";
import PageHeader from "../components/common/PageHeader";
import Section from "../components/common/Section";
import HorizonControl from "../components/forecast/HorizonControl";
import ForecastGate from "../components/forecast/ForecastGate";
import ComparisonChart from "../components/charts/ComparisonChart";
import SeriesLegend from "../components/charts/SeriesLegend";
import ComparisonTable from "../components/tables/ComparisonTable";
import SummaryTable from "../components/tables/SummaryTable";
import { FORECAST_UNIT, MODEL_KEYS } from "../constants/models";
import { availableModels, toComparisonRows } from "../utils/forecastTransforms";
import { usePageTitle } from "../hooks/usePageTitle";

function CompareContent({ view }) {
  const { forecasts, summaries, metadata } = view;
  const unit = metadata.units.forecast ?? FORECAST_UNIT;
  const models = availableModels(forecasts);
  const rows = useMemo(() => toComparisonRows(forecasts), [forecasts]);
  const [hidden, setHidden] = useState([]);
  const [showIntervals, setShowIntervals] = useState(false);

  const visible = models.filter((m) => !hidden.includes(m));
  const toggle = (model) =>
    setHidden((prev) => {
      if (prev.includes(model)) return prev.filter((m) => m !== model);
      // Keep at least one series visible.
      return visible.length > 1 ? [...prev, model] : prev;
    });

  return (
    <Stack spacing={3}>
      <Section
        id="compare-chart"
        title="Forecast comparison"
        description={`Annual electricity generation in ${unit}. Select models to show or hide them.`}
        actions={
          <FormControlLabel
            control={<Switch checked={showIntervals} onChange={(e) => setShowIntervals(e.target.checked)} />}
            label="Show intervals"
          />
        }
      >
        <Stack spacing={2}>
          <SeriesLegend
            models={MODEL_KEYS}
            visible={visible}
            onToggle={toggle}
            disabled={MODEL_KEYS.filter((m) => !models.includes(m))}
          />
          <ComparisonChart
            rows={rows}
            models={visible}
            bandModels={showIntervals ? visible : []}
            unit={unit}
          />
        </Stack>
      </Section>

      <Section
        id="compare-summary"
        title="Summary"
        description="Growth from the first to the last forecast year, as reported by the API. CAGR = compound annual growth rate."
      >
        <SummaryTable summaries={summaries} models={models} unit={unit} />
      </Section>

      <Section id="compare-table" title="Year-by-year comparison" description="Point forecast with prediction interval below.">
        <ComparisonTable rows={rows} models={models} unit={unit} />
      </Section>
    </Stack>
  );
}

export default function Compare() {
  usePageTitle("Compare models");
  return (
    <>
      <PageHeader
        eyebrow="Model comparison"
        title="Compare models"
        description="Prophet, Random Forest and XGBoost side by side for the selected horizon."
        actions={<HorizonControl />}
      />
      <ForecastGate>{(view) => <CompareContent view={view} />}</ForecastGate>
    </>
  );
}
