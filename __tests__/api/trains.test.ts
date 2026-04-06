import { describe, it, expect } from "vitest";
import { parseScheduleResponse, stationNameMatchesCode } from "@/lib/njt/transforms";
import { getMockSchedule } from "@/lib/mock/trains";

describe("stationNameMatchesCode", () => {
  it("matches known codes to name fragments", () => {
    expect(stationNameMatchesCode("Newark Penn Station", "NP")).toBe(true);
    expect(stationNameMatchesCode("New York Penn Station", "NY")).toBe(true);
    expect(stationNameMatchesCode("Trenton", "TR")).toBe(true);
    expect(stationNameMatchesCode("Princeton Junction", "PR")).toBe(true);
  });

  it("returns false for unknown code", () => {
    expect(stationNameMatchesCode("Some Station", "XX")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(stationNameMatchesCode("newark penn station", "NP")).toBe(true);
  });
});

describe("parseScheduleResponse — multipleTrains scenario", () => {
  const raw = getMockSchedule("NP", "multipleTrains");

  it("returns trains filtered to NP→NY route", () => {
    const result = parseScheduleResponse(raw, "NP", "NY");
    expect(result.fullScreenMessage).toBeUndefined();
    expect(result.trains.length).toBeGreaterThan(0);
    // All returned trains must stop at New York after Newark
    for (const train of result.trains) {
      const stops = train.stops.map((s) => s.name);
      const fromIdx = stops.findIndex((n) => n.toLowerCase().includes("newark penn"));
      const toIdx = stops.findIndex((n) => n.toLowerCase().includes("new york penn"));
      expect(fromIdx).toBeGreaterThanOrEqual(0);
      expect(toIdx).toBeGreaterThan(fromIdx);
    }
  });

  it("does not include trains that don't serve the destination", () => {
    // Raritan Valley train goes to High Bridge, not New York
    const result = parseScheduleResponse(raw, "NP", "NY");
    const trainIds = result.trains.map((t) => t.trainId);
    expect(trainIds).not.toContain("7801"); // Raritan Valley / High Bridge
  });

  it("includes the banner message", () => {
    const result = parseScheduleResponse(raw, "NP", "NY");
    expect(result.bannerMessage).toMatch(/track work/i);
  });
});

describe("parseScheduleResponse — singleTrain scenario", () => {
  it("normalizes ITEM as object (not array) to a train array", () => {
    const raw = getMockSchedule("NP", "singleTrain");
    const result = parseScheduleResponse(raw, "NP", "NY");
    expect(result.trains).toHaveLength(1);
    expect(result.trains[0].trainId).toBe("9001");
  });
});

describe("parseScheduleResponse — noTrains scenario", () => {
  it("returns an empty trains array", () => {
    const raw = getMockSchedule("NP", "noTrains");
    const result = parseScheduleResponse(raw, "NP", "NY");
    expect(result.trains).toHaveLength(0);
    expect(result.fullScreenMessage).toBeUndefined();
  });
});

describe("parseScheduleResponse — fullScreenMessage scenario", () => {
  it("returns the message and no trains", () => {
    const raw = getMockSchedule("NP", "fullScreenMessage");
    const result = parseScheduleResponse(raw, "NP", "NY");
    expect(result.trains).toHaveLength(0);
    expect(result.fullScreenMessage).toBeTruthy();
    expect(typeof result.fullScreenMessage).toBe("string");
  });
});

describe("parseScheduleResponse — delayed scenario", () => {
  it("includes the delayed train with secondsLate > 0", () => {
    const raw = getMockSchedule("NP", "delayed");
    const result = parseScheduleResponse(raw, "NP", "TR");
    const delayed = result.trains.find((t) => t.secondsLate > 0);
    expect(delayed).toBeDefined();
    expect(delayed?.secondsLate).toBe(900);
    expect(delayed?.status).toMatch(/late/i);
  });

  it("includes on-time trains alongside delayed ones", () => {
    const raw = getMockSchedule("NP", "delayed");
    const result = parseScheduleResponse(raw, "NP", "NY");
    const onTime = result.trains.find((t) => t.secondsLate === 0);
    expect(onTime).toBeDefined();
  });
});

describe("parseScheduleResponse — edge cases", () => {
  it("returns an error message for null input", () => {
    const result = parseScheduleResponse(null, "NP", "NY");
    expect(result.fullScreenMessage).toBeTruthy();
    expect(result.trains).toHaveLength(0);
  });

  it("filters out trains where destination doesn't appear after origin", () => {
    // A train going in the wrong direction (to → from order reversed)
    const raw = {
      STATION: {
        STATION_2CHAR: "NY",
        STATIONNAME: "New York Penn Station",
        ITEMS: {
          ITEM: {
            TRAIN_ID: "1111",
            LINE: "Northeast Corrdr",
            DESTINATION: "Newark",
            SCHED_DEP_DATE: new Date().toISOString(),
            TRACK: "5",
            STATUS: "in 5 Min",
            SEC_LATE: "0",
            STOPS: {
              STOP: [
                { n: "New York Penn Station", TIME: new Date().toISOString(), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                { n: "Newark Penn Station", TIME: new Date().toISOString(), DEPARTED: "NO", STOP_STATUS: "OnTime" },
              ],
            },
          },
        },
      },
    };
    // Querying NY→NP should find this train
    const result = parseScheduleResponse(raw, "NY", "NP");
    expect(result.trains).toHaveLength(1);

    // Querying NP→NY should NOT (origin doesn't appear in stops at idx > dest)
    const reversed = parseScheduleResponse(raw, "NP", "NY");
    expect(reversed.trains).toHaveLength(0);
  });
});
