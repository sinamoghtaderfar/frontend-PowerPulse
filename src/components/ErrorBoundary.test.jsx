import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

const Broken = () => {
  throw new Error("render failure");
};

describe("ErrorBoundary", () => {
  it("renders a fallback instead of crashing", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.queryByText("render failure")).not.toBeInTheDocument();
    spy.mockRestore();
  });
});
