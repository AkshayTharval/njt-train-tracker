// Station as returned by /api/stations
export interface Station {
  code: string;   // 2-character NJT station code (e.g. "NP")
  name: string;   // Full station name (e.g. "Newark Penn Station")
}

// A single stop within a train's route
export interface TrainStop {
  name: string;
  time: string;            // ISO string
  departed: boolean;
  status: string;          // "OnTime" | "Late" | etc.
}

// A single train as returned by /api/trains
export interface Train {
  trainId: string;         // e.g. "3243"
  line: string;            // e.g. "Northeast Corrdr"
  destination: string;     // e.g. "New York"
  scheduledDeparture: string; // ISO string for origin station departure
  track: string;           // may be empty string if not yet assigned
  status: string;          // human-readable, e.g. "in 5 Min", "LATE 10 min"
  secondsLate: number;     // 0 = on time, positive = delayed
  stops: TrainStop[];
}

// Shape returned by /api/trains
export interface TrainsResponse {
  trains: Train[];
  stationName: string;
  fullScreenMessage?: string;   // when set, no schedule data is available
  bannerMessage?: string;
}

// Shape returned by /api/stations
export interface StationsResponse {
  stations: Station[];
}
