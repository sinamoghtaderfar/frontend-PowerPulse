import { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_YEARS_AHEAD } from "../api/forecastApi";
import { useForecastData } from "../hooks/useForecastData";
import { useHealth } from "../hooks/useHealth";

const ForecastContext = createContext(null);

/** Shares the selected horizon, forecast data and API health across pages. */
export function ForecastProvider({ children }) {
  const [yearsAhead, setYearsAhead] = useState(DEFAULT_YEARS_AHEAD);
  const { data, previousData, loading, error, refresh } = useForecastData(yearsAhead);
  const health = useHealth();

  const value = useMemo(
    () => ({ yearsAhead, setYearsAhead, data, previousData, loading, error, refresh, health }),
    [yearsAhead, data, previousData, loading, error, refresh, health]
  );
  return <ForecastContext.Provider value={value}>{children}</ForecastContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useForecast() {
  const context = useContext(ForecastContext);
  if (!context) throw new Error("useForecast must be used inside <ForecastProvider>");
  return context;
}
