import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./renderApp";
import { backendResponse, createBackendFetch, healthResponse, jsonResponse } from "./fixtures";

vi.mock("recharts", async (importOriginal) => (await import("./renderApp")).rechartsWithSize(importOriginal));

const forecastCalls = (fetchMock) =>
  fetchMock.mock.calls.map(([url]) => String(url)).filter((url) => url.startsWith("/forecast/all"));

describe("application", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shows a loading state, then real summary cards and the API status", async () => {
    let release;
    const gate = new Promise((resolve) => (release = resolve));
    const fetchMock = createBackendFetch({
      forecast: () => gate.then(() => jsonResponse(backendResponse(10))),
    });
    vi.stubGlobal("fetch", fetchMock);
    renderApp("/");

    expect(await screen.findByText(/Loading forecasts/)).toBeInTheDocument();
    release();
    expect(await screen.findByText("Prophet · 2035")).toBeInTheDocument();
    // 495.5 - 15 * 9 = 360.5
    expect(screen.getByText("360.5")).toBeInTheDocument();
    expect(screen.getByText(/Lowest 360\.5 – highest 534\.4 TWh/)).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Model comparison chart" })).toBeInTheDocument();
    expect(await screen.findByRole("status", { name: /API online/ })).toBeInTheDocument();
    expect(forecastCalls(fetchMock)).toEqual(["/forecast/all?years_ahead=10"]);
    expect(document.title).toBe("Overview · PowerPulse");
  });

  it("changes the horizon and requests it from the API", async () => {
    const user = userEvent.setup();
    const fetchMock = createBackendFetch();
    vi.stubGlobal("fetch", fetchMock);
    renderApp("/");
    await screen.findByText("Prophet · 2035");

    await user.click(screen.getByRole("button", { name: "3 years ahead" }));
    expect(await screen.findByText("Prophet · 2028")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3 years ahead" })).toHaveAttribute("aria-pressed", "true");
    expect(forecastCalls(fetchMock)).toContain("/forecast/all?years_ahead=3");
  });

  it("shows an error state with a working retry", async () => {
    const user = userEvent.setup();
    let fail = true;
    vi.stubGlobal(
      "fetch",
      createBackendFetch({
        forecast: (url) =>
          fail
            ? Promise.reject(new TypeError("Failed to fetch"))
            : jsonResponse(backendResponse(Number(url.searchParams.get("years_ahead")))),
      })
    );
    renderApp("/compare");

    expect(await screen.findByText(/Unable to reach the forecast service/)).toBeInTheDocument();
    fail = false;
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("table", { name: /Forecast comparison by year/ })).toBeInTheDocument();
  });

  it("reports unavailable models honestly", async () => {
    vi.stubGlobal(
      "fetch",
      createBackendFetch({
        health: () => jsonResponse(healthResponse({ random_forest: false })),
        forecast: () => jsonResponse(backendResponse(10, { unavailable: ["random_forest"] })),
      })
    );
    renderApp("/");
    expect(await screen.findByText(/Random Forest is currently unavailable/)).toBeInTheDocument();
    expect(screen.queryByText("Random Forest · 2035")).not.toBeInTheDocument();
    expect(await screen.findByRole("status", { name: /API degraded.*Random Forest/ })).toBeInTheDocument();
  });

  it("shows an empty state when the API returns no rows", async () => {
    vi.stubGlobal(
      "fetch",
      createBackendFetch({ forecast: () => jsonResponse({ forecasts: { prophet: [], random_forest: [], xgboost: [] } }) })
    );
    renderApp("/");
    expect(await screen.findByText("No forecast data available")).toBeInTheDocument();
  });

  it("deep-links to a model and switches models", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", createBackendFetch());
    renderApp("/forecast?model=random-forest");

    expect(await screen.findByRole("heading", { level: 1, name: "Random Forest forecast" })).toBeInTheDocument();
    const table = await screen.findByRole("table", { name: "Random Forest forecast values by year" });
    expect(within(table).getByText("520.9")).toBeInTheDocument();
    expect(within(table).getByText("450.9 – 590.9")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /XGBoost/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "XGBoost forecast" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "XGBoost forecast values by year" })).toBeInTheDocument();
  });

  it("marks years without a calibrated interval", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", createBackendFetch());
    renderApp("/forecast");
    await screen.findByRole("table", { name: "Prophet forecast values by year" });
    await user.click(screen.getByRole("button", { name: "15 years ahead" }));
    const table = await screen.findByRole("table", { name: "Prophet forecast values by year" });
    await waitFor(() => expect(within(table).getAllByRole("row")).toHaveLength(16));
    expect(screen.getByText(/available up to 2036/)).toBeInTheDocument();
    const lastRow = within(table).getAllByRole("row").at(-1);
    expect(within(lastRow).getAllByText("—").length).toBeGreaterThan(0);
  });

  it("compares models: summary from the API, toggling series and intervals", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", createBackendFetch());
    renderApp("/compare");

    const summary = await screen.findByRole("table", { name: "Forecast summary by model" });
    expect(within(summary).getAllByText("2026-2035")).toHaveLength(3);
    const prophetChip = screen.getByRole("button", { name: "Prophet" });
    expect(prophetChip).toHaveAttribute("aria-pressed", "true");
    await user.click(prophetChip);
    expect(prophetChip).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("switch", { name: "Show intervals" }));
    expect(screen.getByText(/Shaded bands: prediction intervals/)).toBeInTheDocument();
  });

  it("navigates between pages with an active state", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", createBackendFetch());
    renderApp("/");
    const nav = screen.getAllByRole("navigation", { name: "Main" })[0];
    await user.click(within(nav).getByRole("link", { name: "Methodology" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Data, models and limitations" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Methodology" })).toHaveAttribute("aria-current", "page");
    expect(document.title).toBe("Methodology · PowerPulse");
  });

  it("redirects the legacy custom forecast URL to an honest unavailable page", async () => {
    vi.stubGlobal("fetch", createBackendFetch());
    renderApp("/customforecast");
    expect(await screen.findByRole("heading", { name: "Custom forecasts are not available" })).toBeInTheDocument();
  });

  it("renders a not-found page for unknown routes", async () => {
    vi.stubGlobal("fetch", createBackendFetch());
    renderApp("/does-not-exist");
    expect(await screen.findByText("Page not found")).toBeInTheDocument();
  });
});
