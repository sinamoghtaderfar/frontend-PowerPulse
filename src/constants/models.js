/** Model keys exactly as returned by the backend in `forecasts` / `summaries`. */
export const MODEL_KEYS = ["prophet", "random_forest", "xgboost"];

export const MODEL_NAMES = {
  prophet: "Prophet",
  random_forest: "Random Forest",
  xgboost: "XGBoost",
};

export const MODEL_COLORS = {
  prophet: "#4285F4",
  random_forest: "#34A853",
  xgboost: "#EA4335",
};

/** Backend target column `electricity_generation` (OWID energy data, TWh). */
export const FORECAST_UNIT = "TWh";
export const FORECAST_LABEL = `Electricity generation (${FORECAST_UNIT})`;

export const getModelDisplayName = (model) => MODEL_NAMES[model] ?? model;
export const getModelColor = (model) => MODEL_COLORS[model] ?? "#000000";
