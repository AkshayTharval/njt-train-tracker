import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the transform logic and mock data directly —
// Next.js route handlers require the full Next.js runtime to invoke.

import { parseStationListResponse } from "@/lib/njt/transforms";
import { MOCK_STATIONS } from "@/lib/mock/stations";

describe("MOCK_STATIONS", () => {
  it("contains at least 10 stations", () => {
    expect(MOCK_STATIONS.length).toBeGreaterThanOrEqual(10);
  });

  it("every station has a non-empty code and name", () => {
    for (const s of MOCK_STATIONS) {
      expect(s.code.length).toBeGreaterThan(0);
      expect(s.name.length).toBeGreaterThan(0);
    }
  });

  it("all codes are exactly 2 characters", () => {
    for (const s of MOCK_STATIONS) {
      expect(s.code).toHaveLength(2);
    }
  });

  it("has no duplicate codes", () => {
    const codes = MOCK_STATIONS.map((s) => s.code);
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });
});

describe("parseStationListResponse", () => {
  it("parses a station list XML response", () => {
    const parsed = {
      STATIONLIST: {
        STATION: [
          { STATION_2CHAR: "NP", STATIONNAME: "Newark Penn Station" },
          { STATION_2CHAR: "NY", STATIONNAME: "New York Penn Station" },
        ],
      },
    };
    const stations = parseStationListResponse(parsed);
    expect(stations).toHaveLength(2);
    // Sorted alphabetically: "New York" < "Newark"
    expect(stations[0].code).toBe("NY");
    expect(stations[0].name).toBe("New York Penn Station");
    expect(stations[1].code).toBe("NP");
    expect(stations[1].name).toBe("Newark Penn Station");
  });

  it("returns stations sorted alphabetically by name", () => {
    const parsed = {
      STATIONLIST: {
        STATION: [
          { STATION_2CHAR: "TR", STATIONNAME: "Trenton" },
          { STATION_2CHAR: "AB", STATIONNAME: "Aberdeen-Matawan" },
          { STATION_2CHAR: "NP", STATIONNAME: "Newark Penn Station" },
        ],
      },
    };
    const stations = parseStationListResponse(parsed);
    expect(stations.map((s) => s.name)).toEqual([
      "Aberdeen-Matawan",
      "Newark Penn Station",
      "Trenton",
    ]);
  });

  it("handles a single station (object, not array)", () => {
    const parsed = {
      STATIONLIST: {
        STATION: { STATION_2CHAR: "NP", STATIONNAME: "Newark Penn Station" },
      },
    };
    const stations = parseStationListResponse(parsed);
    expect(stations).toHaveLength(1);
    expect(stations[0].code).toBe("NP");
  });

  it("returns empty array for malformed input", () => {
    expect(parseStationListResponse(null)).toEqual([]);
    expect(parseStationListResponse({})).toEqual([]);
    expect(parseStationListResponse({ STATIONLIST: {} })).toEqual([]);
  });

  it("filters out stations missing code or name", () => {
    const parsed = {
      STATIONLIST: {
        STATION: [
          { STATION_2CHAR: "NP", STATIONNAME: "Newark Penn Station" },
          { STATION_2CHAR: "", STATIONNAME: "Bad Station" },
          { STATIONNAME: "Also Bad" },
        ],
      },
    };
    const stations = parseStationListResponse(parsed);
    expect(stations).toHaveLength(1);
    expect(stations[0].code).toBe("NP");
  });
});
