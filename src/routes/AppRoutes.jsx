import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";

const Overview = lazy(() => import("../pages/Overview"));
const ModelForecast = lazy(() => import("../pages/ModelForecast"));
const Compare = lazy(() => import("../pages/Compare"));
const Methodology = lazy(() => import("../pages/Methodology"));
const CustomForecast = lazy(() => import("../pages/CustomForecast"));
const NotFound = lazy(() => import("../pages/NotFound"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Overview />} />
        <Route path="forecast" element={<ModelForecast />} />
        <Route path="compare" element={<Compare />} />
        <Route path="methodology" element={<Methodology />} />
        <Route path="custom-forecast" element={<CustomForecast />} />
        {/* Legacy URL */}
        <Route path="customforecast" element={<Navigate to="/custom-forecast" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
