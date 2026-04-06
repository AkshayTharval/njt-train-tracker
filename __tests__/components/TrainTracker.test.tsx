import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import TrainTracker from "@/app/components/TrainTracker";
import type { Station, TrainsResponse } from "@/lib/types";

// ── Mock Next.js navigation ──────────────────────────────────────────────────
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams("from=NP&to=NY"),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────
const STATIONS: Station[] = [
  { code: "NP", name: "Newark Penn Station" },
  { code: "NY", name: "New York Penn Station" },
];

const GOOD_RESPONSE: TrainsResponse = {
  stationName: "Newark Penn",
  trains: [
    {
      trainId: "3243",
      line: "Northeast Corrdr",
      destination: "New York",
      scheduledDeparture: new Date(Date.now() + 10 * 60_000).toISOString(),
      track: "2",
      status: "in 10 Min",
      secondsLate: 0,
      stops: [
        { name: "Newark Penn Station", time: new Date().toISOString(), departed: false, status: "OnTime" },
        { name: "New York Penn Station", time: new Date().toISOString(), departed: false, status: "OnTime" },
      ],
    },
  ],
};

// ── Initial load tests (real timers) ─────────────────────────────────────────
// These tests don't touch the interval — no fake timers needed.

describe("TrainTracker — initial load", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => GOOD_RESPONSE,
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the skeleton on first load, then the board", async () => {
    render(<TrainTracker initialStations={STATIONS} />);
    // Skeleton is shown immediately before fetch resolves
    expect(screen.getByTestId("board-skeleton")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId("board-skeleton")).not.toBeInTheDocument();
    });
    expect(screen.getByText("#3243")).toBeInTheDocument();
  });

  it("shows last-updated timestamp after first successful fetch", async () => {
    render(<TrainTracker initialStations={STATIONS} />);
    await waitFor(() => {
      expect(screen.getByTestId("last-updated")).toBeInTheDocument();
    });
  });

  it("shows the error state when the fetch fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "API is down" }),
    } as Response);

    render(<TrainTracker initialStations={STATIONS} />);
    await waitFor(() => {
      expect(screen.getByTestId("trains-error")).toBeInTheDocument();
    });
    expect(screen.getByText("API is down")).toBeInTheDocument();
  });
});

// ── Auto-refresh tests (fake timers) ─────────────────────────────────────────

describe("TrainTracker — auto-refresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("calls fetch again after 30 seconds", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => GOOD_RESPONSE,
    } as Response);

    render(<TrainTracker initialStations={STATIONS} />);

    // Let the initial fetch resolve
    await vi.advanceTimersByTimeAsync(100);
    const callsAfterInit = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(callsAfterInit).toBeGreaterThan(0);

    // Advance past the refresh interval
    await vi.advanceTimersByTimeAsync(30_001);

    const callsAfterRefresh = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(callsAfterRefresh).toBeGreaterThan(callsAfterInit);
  });

  it("shows stale-warning when a background refresh fails but keeps existing data", async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return { ok: true, json: async () => GOOD_RESPONSE } as Response;
      }
      return { ok: false, json: async () => ({ error: "Network error" }) } as Response;
    });

    render(<TrainTracker initialStations={STATIONS} />);

    // Initial fetch resolves — advance time and flush state updates
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(screen.getByText("#3243")).toBeInTheDocument();

    // Background refresh fails — flush state updates with act
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_001);
    });

    expect(screen.getByTestId("stale-warning")).toBeInTheDocument();
    // Previous train data is still shown
    expect(screen.getByText("#3243")).toBeInTheDocument();
  });

  it("fetch is called on each interval tick", async () => {
    // Simpler test: just verify fetch call count increases every 30s
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => GOOD_RESPONSE,
    } as Response);

    render(<TrainTracker initialStations={STATIONS} />);

    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    const after1 = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.length;

    await act(async () => { await vi.advanceTimersByTimeAsync(30_001); });
    const after2 = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.length;

    await act(async () => { await vi.advanceTimersByTimeAsync(30_001); });
    const after3 = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.length;

    expect(after2).toBeGreaterThan(after1);
    expect(after3).toBeGreaterThan(after2);
  });
});
