import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomForecastForm from "./CustomForecastForm";

const selectOption = async (user, label, option) => {
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(within(screen.getByRole("listbox")).getByRole("option", { name: option }));
};

describe("CustomForecastForm", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<CustomForecastForm />);
    await user.click(screen.getByRole("button", { name: "Generate Forecast" }));
    expect(screen.getByText("Please select a CSV file.")).toBeInTheDocument();
    expect(screen.getByText("Please select a country.")).toBeInTheDocument();
    expect(screen.getByText("Please select a model.")).toBeInTheDocument();
  });

  it("rejects non-CSV files", async () => {
    const user = userEvent.setup();
    render(<CustomForecastForm />);
    fireEvent.change(screen.getByTestId("csv-input"), {
      target: { files: [new File(["x"], "data.exe", { type: "application/octet-stream" })] },
    });
    await user.click(screen.getByRole("button", { name: "Generate Forecast" }));
    expect(screen.getByText("Only .csv files are supported.")).toBeInTheDocument();
  });

  it("does not call a non-existent backend endpoint for valid input", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<CustomForecastForm />);

    fireEvent.change(screen.getByTestId("csv-input"), {
      target: { files: [new File(["year,value\n2020,1"], "data.csv", { type: "text/csv" })] },
    });
    await selectOption(user, "Country", "Germany");
    await selectOption(user, "Machine Learning Model", "XGBoost");
    await user.click(screen.getByRole("button", { name: "Generate Forecast" }));

    expect(screen.getByText(/Custom forecasts are not available yet/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
