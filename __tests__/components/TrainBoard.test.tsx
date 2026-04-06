import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import TrainBoard from "@/app/components/TrainBoard";
import straightTrainsData from "../fixtures/trainsMultiple";
import type { TrainsResponse } from "@/lib/types";

describe("TrainBoard — normal data", () => {
  it("renders one row per train", () => {
    render(<TrainBoard data={straightTrainsData} from="NP" to="NY" />);
    const rows = screen.getAllByTestId("train-row");
    expect(rows.length).toBe(straightTrainsData.trains.length);
  });

  it("displays train number, line, and destination", () => {
    render(<TrainBoard data={straightTrainsData} from="NP" to="NY" />);
    const train = straightTrainsData.trains[0];
    expect(screen.getByText(`#${train.trainId}`)).toBeInTheDocument();
    // Both trains share the same line name — verify at least one appears
    expect(screen.getAllByText(train.line).length).toBeGreaterThan(0);
    expect(screen.getByText(`→ ${train.destination}`)).toBeInTheDocument();
  });

  it("shows track number when available", () => {
    render(<TrainBoard data={straightTrainsData} from="NP" to="NY" />);
    const train = straightTrainsData.trains.find((t) => t.track);
    expect(train).toBeDefined();
    expect(screen.getByText(train!.track)).toBeInTheDocument();
  });

  it("shows TBD when track is empty", () => {
    render(<TrainBoard data={straightTrainsData} from="NP" to="NY" />);
    const tbds = screen.getAllByText("TBD");
    const noTrackTrains = straightTrainsData.trains.filter((t) => !t.track);
    expect(tbds.length).toBe(noTrackTrains.length);
  });

  it("shows banner message when present", () => {
    render(<TrainBoard data={straightTrainsData} from="NP" to="NY" />);
    if (straightTrainsData.bannerMessage) {
      expect(screen.getByTestId("banner-message")).toHaveTextContent(
        straightTrainsData.bannerMessage
      );
    }
  });
});

describe("TrainBoard — delayed train", () => {
  const delayedData: TrainsResponse = {
    trains: [
      {
        trainId: "4500",
        line: "Northeast Corrdr",
        destination: "Trenton",
        scheduledDeparture: new Date(Date.now() + 5 * 60_000).toISOString(),
        track: "",
        status: "LATE 15 min",
        secondsLate: 900,
        stops: [],
      },
      {
        trainId: "3310",
        line: "Northeast Corrdr",
        destination: "New York",
        scheduledDeparture: new Date(Date.now() + 18 * 60_000).toISOString(),
        track: "1",
        status: "in 18 Min",
        secondsLate: 0,
        stops: [],
      },
    ],
    stationName: "Newark Penn",
  };

  it("marks the delayed row with data-delayed=true", () => {
    render(<TrainBoard data={delayedData} from="NP" to="TR" />);
    const rows = screen.getAllByTestId("train-row");
    const delayedRow = rows.find((r) => r.getAttribute("data-delayed") === "true");
    expect(delayedRow).toBeDefined();
  });

  it("shows a LATE status badge on the delayed train", () => {
    render(<TrainBoard data={delayedData} from="NP" to="TR" />);
    expect(screen.getByText(/LATE 15 min/i)).toBeInTheDocument();
  });

  it("on-time trains do not have data-delayed=true", () => {
    render(<TrainBoard data={delayedData} from="NP" to="NY" />);
    const rows = screen.getAllByTestId("train-row");
    const onTimeRow = rows.find((r) => r.getAttribute("data-delayed") === "false");
    expect(onTimeRow).toBeDefined();
  });
});

describe("TrainBoard — fullScreenMessage", () => {
  it("renders the service alert, not the table", () => {
    const data: TrainsResponse = {
      trains: [],
      stationName: "Newark Penn",
      fullScreenMessage: "All service suspended.",
    };
    render(<TrainBoard data={data} from="NP" to="NY" />);
    expect(screen.getByTestId("fullscreen-message")).toBeInTheDocument();
    expect(screen.getByText("All service suspended.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});

describe("TrainBoard — no trains", () => {
  it("shows empty state message", () => {
    const data: TrainsResponse = {
      trains: [],
      stationName: "Newark Penn",
    };
    render(<TrainBoard data={data} from="NP" to="NY" />);
    expect(screen.getByTestId("no-trains")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
