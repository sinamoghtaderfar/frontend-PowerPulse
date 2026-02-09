import { useMemo } from "react";

const MODEL_NAMES = {
  prophet: "Prophet",
  random_forest: "Random Forest",
  xgboost: "XGBoost"
};

const MODEL_COLORS = {
  prophet: "#4285F4",
  random: "#34A853",
  xgboost: "#EA4335"
};

const models = Object.keys(MODEL_NAMES);

export function useModelHelpers() {
  const getModelDisplayName = (model) => MODEL_NAMES[model] || model;
  const getModelColor = (model) => MODEL_COLORS[model] || "#000000";

  return { getModelDisplayName, getModelColor, models };
}

export function useSingleModelData(data, selectedModel) {
  return useMemo(() => {
    
    const modelData = data[selectedModel] || [];
    return modelData.map((item) => ({
      year: item?.year ?? 0,
      forecast: item?.forecast ?? null,
      lower: item?.lower ?? null,
      upper: item?.upper ?? null,
      model: MODEL_NAMES[selectedModel] || selectedModel
    }));
  }, [data, selectedModel]);
}

export function useCombinedChartData(data) {
  return useMemo(() => {
    const combined = [];
    models.forEach((model) => {
      const modelData = data[model] || [];
      modelData.forEach((item) => {
        combined.push({
          year: item?.year ?? 0,
          forecast: item?.forecast ?? null,
          lower: item?.lower ?? null,
          upper: item?.upper ?? null,
          model: MODEL_NAMES[model],
          color: MODEL_COLORS[model]
        });
      });
    });
    combined.sort((a, b) => a.year - b.year);
    return combined;
  }, [data]);
}

export function useComparisonTableData(combinedChartData) {
  return useMemo(() => {
    const tableData = [];
    const years = [...new Set(combinedChartData.map((item) => item.year))].sort((a, b) => a - b);

    years.forEach((year) => {
      const row = { date: String(year) };
      models.forEach((model) => {
        const displayName = MODEL_NAMES[model];
        const point = combinedChartData.find(
          (item) => item.year === year && item.model === displayName
        );
        row[`${model}_forecast`] = point?.forecast ? Number(point.forecast.toFixed(1)) : null;
        row[`${model}_lower`]   = point?.lower   ? Number(point.lower.toFixed(1))   : null;
        row[`${model}_upper`]   = point?.upper   ? Number(point.upper.toFixed(1))   : null;
      });
      tableData.push(row);
    });
    return tableData;
  }, [combinedChartData]);
}