import { useState, useCallback, useEffect } from "react";
import { getAllForecasts } from "../api/energyApi";

export function useForecastData() {
  const [data, setData] = useState({
    prophet: [],
    random_forest: [],
    xgboost: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allForecasts = await getAllForecasts(10);
      setData(allForecasts.forecasts);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load forecast data";
      setError(message);
      console.error("Error fetching forecasts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshCount]);

  const refresh = () => setRefreshCount((prev) => prev + 1);

  return { data, loading, error, refresh };
}