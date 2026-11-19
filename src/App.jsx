import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme/theme";
import AppRoutes from "./routes/AppRoutes";
import { ForecastProvider } from "./context/ForecastContext";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ForecastProvider>
          <AppRoutes />
        </ForecastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
