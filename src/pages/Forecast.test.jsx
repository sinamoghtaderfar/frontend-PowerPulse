import { cloneElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Forecast from "./Forecast";
import { backendResponse, jsonResponse } from "../test/fixtures";

// jsdom has no layout, so give charts a fixed size to render them for real.
vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal()),
  ResponsiveContainer: ({ children }) => cloneElement(children, { width: 800, height: 400 }),
}));

describe("Forecast page", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shows loading, then the selected model's table", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(backendResponse)));
    render(<Forecast />);

    expect(screen.getByText(/Loading forecast data/)).toBeInTheDocument();
    expect(await screen.findByText("Prophet Forecast")).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Forecast values by year" });
    expect(within(table).getByText("508.1")).toBeInTheDocument();
    expect(within(table).getByText("476.5 – 539.9")).toBeInTheDocument();
  });

  it("switches models and opens the comparison view", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(backendResponse)));
    render(<Forecast />);

    await user.click(await screen.findByRole("button", { name: "Random Forest" }));
    expect(screen.getByText("Random Forest Forecast")).toBeInTheDocument();
    expect(screen.getByText("511.3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Compare All Models/ }));
    const table = screen.getByRole("table", { name: /Forecast comparison/ });
    expect(within(table).getByText("533.0")).toBeInTheDocument();
    expect(within(table).getAllByRole("row")).toHaveLength(3);
  });

  it("shows an error with a working retry", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(jsonResponse(backendResponse));
    vi.stubGlobal("fetch", fetchMock);
    render(<Forecast />);

    expect(await screen.findByText(/Unable to reach the forecast service/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry loading forecasts" }));
    expect(await screen.findByText("Prophet Forecast")).toBeInTheDocument();
  });

  it("shows an empty state when the backend returns no rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ forecasts: { prophet: [], random_forest: [], xgboost: [] } }))
    );
    render(<Forecast />);
    expect(await screen.findByText(/No forecast data is currently available/)).toBeInTheDocument();
  });
});
