import { cloneElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../theme/theme";
import AppRoutes from "../routes/AppRoutes";
import { ForecastProvider } from "../context/ForecastContext";

/** Render the full application at `path`. */
export function renderApp(path = "/") {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MemoryRouter initialEntries={[path]}>
        <ForecastProvider>
          <AppRoutes />
        </ForecastProvider>
      </MemoryRouter>
    </ThemeProvider>
  );
}

/** Recharts mock factory: give ResponsiveContainer a fixed size in jsdom. */
export async function rechartsWithSize(importOriginal) {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => cloneElement(children, { width: 800, height: 400 }),
  };
}
