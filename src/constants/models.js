/** Model keys exactly as returned by the backend in `forecasts` / `summaries`. */
export const MODEL_KEYS = ["prophet", "random_forest", "xgboost"];

export const MODEL_NAMES = {
  prophet: "Prophet",
  random_forest: "Random Forest",
  xgboost: "XGBoost",
};

/** Colour-blind-distinguishable series colours (also differ in marker shape). */
export const MODEL_COLORS = {
  prophet: "#6E56CF",
  random_forest: "#0E8F6E",
  xgboost: "#D5580F",
};

export const MODEL_MARKERS = {
  prophet: "circle",
  random_forest: "square",
  xgboost: "diamond",
};

export const MODEL_DESCRIPTIONS = {
  prophet:
    "Additive time-series model with a linear trend and population, GDP and renewables share as regressors.",
  random_forest:
    "Ensemble of decision trees on lagged generation, rolling statistics and economic features, forecast year by year.",
  xgboost:
    "Gradient-boosted trees on lagged generation, rolling statistics and economic features, forecast year by year.",
};

/** URL slugs for model deep links (`/forecast?model=random-forest`). */
export const MODEL_SLUGS = {
  prophet: "prophet",
  random_forest: "random-forest",
  xgboost: "xgboost",
};

export const modelFromSlug = (slug) =>
  MODEL_KEYS.find((key) => MODEL_SLUGS[key] === slug || key === slug) ?? null;

/**
 * Backend target column `electricity_generation` (OWID energy data, TWh).
 * The API reports units in `metadata.units`; this is the fallback.
 */
export const FORECAST_UNIT = "TWh";
export const TARGET_LABEL = "Electricity generation";
export const FORECAST_LABEL = `${TARGET_LABEL} (${FORECAST_UNIT})`;
export const REGION_LABEL = "Germany";

export const getModelDisplayName = (model) => MODEL_NAMES[model] ?? model;
export const getModelColor = (model) => MODEL_COLORS[model] ?? "#000000";
