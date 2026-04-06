// Mock train schedule data mirroring the exact shape of getTrainScheduleJSON.
// This file is the single source of truth for all mock scenarios.
// Real API responses are normalized to the same shape in lib/njt/transforms.ts

export type MockScenario =
  | "multipleTrains"
  | "singleTrain"
  | "noTrains"
  | "fullScreenMessage"
  | "delayed";

function isoDate(minutesFromNow: number): string {
  const d = new Date(Date.now() + minutesFromNow * 60_000);
  return d.toISOString();
}

// Each scenario returns raw JSON shaped exactly like getTrainScheduleJSON
// so the same transform code handles both mock and real data.
export function getMockSchedule(stationCode: string, scenario: MockScenario = "multipleTrains") {
  const stationName = stationCode === "NP" ? "Newark Penn" : "New Brunswick";

  if (scenario === "fullScreenMessage") {
    return {
      STATION: {
        STATION_2CHAR: stationCode,
        STATIONNAME: stationName,
        FULLSCREENMSG: "NJ Transit service is currently suspended on all lines due to a track emergency. Please check njtransit.com for updates.",
      },
    };
  }

  if (scenario === "noTrains") {
    return {
      STATION: {
        STATION_2CHAR: stationCode,
        STATIONNAME: stationName,
        ITEMS: { ITEM: [] },
      },
    };
  }

  if (scenario === "singleTrain") {
    // ITEMS.ITEM is a plain object (not an array) — must be normalized to array
    return {
      STATION: {
        STATION_2CHAR: stationCode,
        STATIONNAME: stationName,
        ITEMS: {
          ITEM: {
            TRAIN_ID: "9001",
            LINE: "Northeast Corrdr",
            DESTINATION: "New York",
            SCHED_DEP_DATE: isoDate(12),
            TRACK: "3",
            STATUS: "in 12 Min",
            SEC_LATE: "0",
            STOPS: {
              STOP: [
                { n: stationName, TIME: isoDate(12), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                { n: "New York Penn Station", TIME: isoDate(30), DEPARTED: "NO", STOP_STATUS: "OnTime" },
              ],
            },
          },
        },
      },
    };
  }

  if (scenario === "delayed") {
    return {
      STATION: {
        STATION_2CHAR: stationCode,
        STATIONNAME: stationName,
        ITEMS: {
          ITEM: [
            {
              TRAIN_ID: "4500",
              LINE: "Northeast Corrdr",
              DESTINATION: "Trenton",
              SCHED_DEP_DATE: isoDate(5),
              TRACK: "",
              STATUS: "LATE 15 min",
              SEC_LATE: "900",
              STOPS: {
                STOP: [
                  { n: stationName, TIME: isoDate(5), DEPARTED: "NO", STOP_STATUS: "Late" },
                  { n: "New Brunswick", TIME: isoDate(22), DEPARTED: "NO", STOP_STATUS: "Late" },
                  { n: "Princeton Junction", TIME: isoDate(35), DEPARTED: "NO", STOP_STATUS: "Late" },
                  { n: "Trenton", TIME: isoDate(55), DEPARTED: "NO", STOP_STATUS: "Late" },
                ],
              },
            },
            {
              TRAIN_ID: "3310",
              LINE: "Northeast Corrdr",
              DESTINATION: "New York",
              SCHED_DEP_DATE: isoDate(18),
              TRACK: "1",
              STATUS: "in 18 Min",
              SEC_LATE: "0",
              STOPS: {
                STOP: [
                  { n: stationName, TIME: isoDate(18), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                  { n: "New York Penn Station", TIME: isoDate(36), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                ],
              },
            },
          ],
        },
      },
    };
  }

  // multipleTrains (default)
  return {
    STATION: {
      STATION_2CHAR: stationCode,
      STATIONNAME: stationName,
      BANNERMSG: "Weekend track work on the Raritan Valley Line. Allow extra travel time.",
      ITEMS: {
        ITEM: [
          {
            TRAIN_ID: "3243",
            LINE: "Northeast Corrdr",
            DESTINATION: "New York",
            SCHED_DEP_DATE: isoDate(8),
            TRACK: "2",
            STATUS: "in 8 Min",
            SEC_LATE: "0",
            STOPS: {
              STOP: [
                { n: stationName, TIME: isoDate(8), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                { n: "Metropark", TIME: isoDate(15), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                { n: "New York Penn Station", TIME: isoDate(28), DEPARTED: "NO", STOP_STATUS: "OnTime" },
              ],
            },
          },
          {
            TRAIN_ID: "7801",
            LINE: "Raritan Valley",
            DESTINATION: "High Bridge",
            SCHED_DEP_DATE: isoDate(14),
            TRACK: "4",
            STATUS: "in 14 Min",
            SEC_LATE: "0",
            STOPS: {
              STOP: [
                { n: stationName, TIME: isoDate(14), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                { n: "Westfield", TIME: isoDate(28), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                { n: "Plainfield", TIME: isoDate(35), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                { n: "High Bridge", TIME: isoDate(75), DEPARTED: "NO", STOP_STATUS: "OnTime" },
              ],
            },
          },
          {
            TRAIN_ID: "3251",
            LINE: "Northeast Corrdr",
            DESTINATION: "Trenton",
            SCHED_DEP_DATE: isoDate(22),
            TRACK: "1",
            STATUS: "in 22 Min",
            SEC_LATE: "0",
            STOPS: {
              STOP: [
                { n: stationName, TIME: isoDate(22), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                { n: "New Brunswick", TIME: isoDate(30), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                { n: "Princeton Junction", TIME: isoDate(45), DEPARTED: "NO", STOP_STATUS: "OnTime" },
                { n: "Trenton", TIME: isoDate(60), DEPARTED: "NO", STOP_STATUS: "OnTime" },
              ],
            },
          },
          {
            TRAIN_ID: "4422",
            LINE: "Northeast Corrdr",
            DESTINATION: "New York",
            SCHED_DEP_DATE: isoDate(0),
            TRACK: "3",
            STATUS: "Arrived",
            SEC_LATE: "0",
            STOPS: {
              STOP: [
                { n: stationName, TIME: isoDate(0), DEPARTED: "YES", STOP_STATUS: "OnTime" },
                { n: "New York Penn Station", TIME: isoDate(18), DEPARTED: "NO", STOP_STATUS: "OnTime" },
              ],
            },
          },
        ],
      },
    },
  };
}
