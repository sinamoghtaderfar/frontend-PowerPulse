import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import useScrollToTop from "../hooks/useScrollToTop";

import MyNavbar from "../components/MyNavbar";
import Footer from "../components/Footer";
import ErrorBoundary from "../components/ErrorBoundary";

const Homepage = lazy(() => import("../pages/Home"));
const Forecast = lazy(() => import("../pages/Forecast"));
const CustomForecast = lazy(() => import("../pages/customforecast"));

const PageFallback = () => (
  <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh" }} role="status">
    <CircularProgress aria-label="Loading page" />
  </Box>
);

function AppContent() {
  useScrollToTop();
  const { pathname } = useLocation();

  return (
    <div className="App">
      <MyNavbar />

      <main className="AppMain">
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/customforecast" element={<CustomForecast />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}

export default AppContent;
