/** Shape of GET /forecast/all as returned by api-Forecast-PowerPulse. */
export const backendResponse = {
  forecasts: {
    prophet: [
      { year: 2026, forecast: 508.12, lower: 476.5, upper: 539.9 },
      { year: 2027, forecast: 507.4, lower: 475.1, upper: 538.2 },
    ],
    random_forest: [
      { year: 2026, forecast: 511.3, lower: 460.0, upper: 562.6, uncertainty_width: 102.6, growth_rate: 2.8 },
      { year: 2027, forecast: 512.0, lower: 461.0, upper: 563.0, uncertainty_width: 102.0, growth_rate: 0.1 },
    ],
    xgboost: [
      { year: 2026, forecast: 533.0, lower: 533.0, upper: 533.0, growth_from_previous: 7.1 },
      { year: 2027, forecast: 534.0, lower: 533.5, upper: 534.5, growth_from_previous: 0.2 },
    ],
  },
  summaries: {},
  metadata: {
    years_ahead: 2,
    models: ["prophet", "random_forest", "xgboost"],
    units: { forecast: "electricity_generation", uncertainty: "95% confidence interval" },
  },
};

export const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
