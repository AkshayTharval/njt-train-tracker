import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StationSelector from "@/app/components/StationSelector";
import type { Station } from "@/lib/types";

const STATIONS: Station[] = [
  { code: "NP", name: "Newark Penn Station" },
  { code: "NY", name: "New York Penn Station" },
  { code: "NB", name: "New Brunswick" },
];

describe("StationSelector", () => {
  it("renders both dropdowns", () => {
    render(
      <StationSelector
        stations={STATIONS}
        from=""
        to=""
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
      />
    );
    expect(screen.getByTestId("select-from")).toBeInTheDocument();
    expect(screen.getByTestId("select-to")).toBeInTheDocument();
  });

  it("populates both dropdowns with all stations", () => {
    render(
      <StationSelector
        stations={STATIONS}
        from=""
        to=""
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
      />
    );
    // Each select has a placeholder + 3 stations = 4 options
    const froms = screen.getByTestId("select-from");
    const tos = screen.getByTestId("select-to");
    expect(froms.querySelectorAll("option")).toHaveLength(4);
    expect(tos.querySelectorAll("option")).toHaveLength(4);
  });

  it("shows the current from value as selected", () => {
    render(
      <StationSelector
        stations={STATIONS}
        from="NP"
        to=""
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
      />
    );
    expect(screen.getByTestId<HTMLSelectElement>("select-from").value).toBe("NP");
  });

  it("shows the current to value as selected", () => {
    render(
      <StationSelector
        stations={STATIONS}
        from=""
        to="NY"
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
      />
    );
    expect(screen.getByTestId<HTMLSelectElement>("select-to").value).toBe("NY");
  });

  it("calls onFromChange with the selected code", async () => {
    const onFromChange = vi.fn();
    render(
      <StationSelector
        stations={STATIONS}
        from=""
        to=""
        onFromChange={onFromChange}
        onToChange={vi.fn()}
      />
    );
    await userEvent.selectOptions(screen.getByTestId("select-from"), "NP");
    expect(onFromChange).toHaveBeenCalledWith("NP");
  });

  it("calls onToChange with the selected code", async () => {
    const onToChange = vi.fn();
    render(
      <StationSelector
        stations={STATIONS}
        from=""
        to=""
        onFromChange={vi.fn()}
        onToChange={onToChange}
      />
    );
    await userEvent.selectOptions(screen.getByTestId("select-to"), "NY");
    expect(onToChange).toHaveBeenCalledWith("NY");
  });

  it("disables both selects when disabled=true", () => {
    render(
      <StationSelector
        stations={STATIONS}
        from=""
        to=""
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
        disabled
      />
    );
    expect(screen.getByTestId("select-from")).toBeDisabled();
    expect(screen.getByTestId("select-to")).toBeDisabled();
  });

  it("renders placeholder options with empty value", () => {
    render(
      <StationSelector
        stations={STATIONS}
        from=""
        to=""
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
      />
    );
    const fromSelect = screen.getByTestId("select-from");
    const firstOption = fromSelect.querySelector("option");
    expect(firstOption?.value).toBe("");
    expect(firstOption?.textContent).toMatch(/select origin/i);
  });
});
