import { Routes, Route } from "react-router-dom";
import useScrollToTop from "../hooks/useScrollToTop";

import MyNavbar from "../components/MyNavbar";
import Homepage from "../pages/Home";
import ForecastProphet from "../pages/Forecast";
import Footer from "../components/Footer";

function AppContent() {
  useScrollToTop();

  return (
    <div className="App">
      <MyNavbar />

      <div className="AppMain">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/forecast" element={<ForecastProphet />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default AppContent;
