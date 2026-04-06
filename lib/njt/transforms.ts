import type { Train, TrainStop, TrainsResponse, Station } from "@/lib/types";

// ─── Raw NJT types (what the API actually returns) ──────────────────────────

interface RawStop {
  n: string;
  TIME: string;
  DEPARTED: string;
  STOP_STATUS: string;
}

interface RawItem {
  TRAIN_ID: string;
  LINE: string;
  DESTINATION: string;
  SCHED_DEP_DATE: string;
  TRACK: string;
  STATUS: string;
  SEC_LATE: string;
  STOPS: { STOP: RawStop | RawStop[] };
}

interface RawStation {
  STATION_2CHAR: string;
  STATIONNAME: string;
  FULLSCREENMSG?: string;
  BANNERMSG?: string;
  ITEMS?: { ITEM: RawItem | RawItem[] };
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function parseStop(raw: RawStop): TrainStop {
  return {
    name: raw.n,
    time: raw.TIME,
    departed: raw.DEPARTED === "YES",
    status: raw.STOP_STATUS,
  };
}

function parseTrain(raw: RawItem): Train {
  const stops = toArray(raw.STOPS?.STOP).map(parseStop);
  return {
    trainId: raw.TRAIN_ID,
    line: raw.LINE,
    destination: raw.DESTINATION,
    scheduledDeparture: raw.SCHED_DEP_DATE,
    track: raw.TRACK ?? "",
    status: raw.STATUS,
    secondsLate: parseInt(raw.SEC_LATE ?? "0", 10) || 0,
    stops,
  };
}

/**
 * Normalizes a raw getTrainScheduleJSON response (from mock or real API)
 * into our typed TrainsResponse shape, then filters to trains that stop
 * at `toCode` *after* stopping at `fromCode`.
 */
export function parseScheduleResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any,
  fromCode: string,
  toCode: string
): TrainsResponse {
  const station: RawStation = raw?.STATION;

  if (!station) {
    return { trains: [], stationName: "", fullScreenMessage: "Invalid API response." };
  }

  if (station.FULLSCREENMSG) {
    return {
      trains: [],
      stationName: station.STATIONNAME,
      fullScreenMessage: station.FULLSCREENMSG,
    };
  }

  const allItems = toArray(station.ITEMS?.ITEM);
  const allTrains = allItems.map(parseTrain);

  // Filter: keep only trains where destination stop appears after origin stop
  // We match stops by checking if the station name contains the code-derived name.
  // Since we have the code but the stop list has full names, we match from the
  // from-station entry (which is the station we queried) using index position.
  // The origin station stop is always the first stop that matches the queried station.
  // The destination must appear *after* the origin in the stop list.
  const filtered = allTrains.filter((train) => {
    const stops = train.stops;
    const fromIdx = stops.findIndex((s) => stationNameMatchesCode(s.name, fromCode));
    const toIdx = stops.findIndex((s) => stationNameMatchesCode(s.name, toCode));
    return fromIdx !== -1 && toIdx !== -1 && toIdx > fromIdx;
  });

  return {
    trains: filtered,
    stationName: station.STATIONNAME,
    bannerMessage: station.BANNERMSG,
  };
}

/**
 * Checks if a stop name "matches" a 2-char station code.
 * The NJT API returns full names in stops but we query by code.
 * We use a simple lookup table for the stations we know about.
 * For real-API use, station names in stops match getStationListXML names.
 */
const CODE_TO_NAME_FRAGMENTS: Record<string, string[]> = {
  NY: ["New York Penn"],
  NP: ["Newark Penn"],
  NB: ["New Brunswick"],
  PR: ["Princeton Junction"],
  TR: ["Trenton"],
  HA: ["Hamilton"],
  AB: ["Aberdeen", "Matawan"],
  LB: ["Long Branch"],
  BL: ["Bay Head"],
  MT: ["Metropark"],
  WF: ["Westfield"],
  PL: ["Plainfield"],
  SO: ["South Orange"],
  MR: ["Morristown"],
  DV: ["Dover"],
  HV: ["High Bridge"],
  SE: ["Secaucus"],
  HO: ["Hoboken"],
  LK: ["Lakewood"],
  TK: ["Tuckahoe"],
};

export function stationNameMatchesCode(stopName: string, code: string): boolean {
  const fragments = CODE_TO_NAME_FRAGMENTS[code];
  if (!fragments) return false;
  const lower = stopName.toLowerCase();
  return fragments.some((f) => lower.includes(f.toLowerCase()));
}

/**
 * Parses a station list XML response into our Station array.
 * The real NJT endpoint returns XML; fast-xml-parser converts it to JS objects.
 * Shape: { STATIONLIST: { STATION: Array<{ STATION_2CHAR, STATIONNAME }> } }
 */
export function parseStationListResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsed: any
): Station[] {
  const items = toArray(parsed?.STATIONLIST?.STATION);
  return items
    .filter((s: { STATION_2CHAR?: string; STATIONNAME?: string }) => s.STATION_2CHAR && s.STATIONNAME)
    .map((s: { STATION_2CHAR: string; STATIONNAME: string }) => ({
      code: s.STATION_2CHAR.trim(),
      name: s.STATIONNAME.trim(),
    }))
    .sort((a: Station, b: Station) => a.name.localeCompare(b.name));
}
