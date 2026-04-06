import type { TrainsResponse } from "@/lib/types";

const now = Date.now();

const trainsMultiple: TrainsResponse = {
  stationName: "Newark Penn",
  bannerMessage: "Weekend track work on the Raritan Valley Line.",
  trains: [
    {
      trainId: "3243",
      line: "Northeast Corrdr",
      destination: "New York",
      scheduledDeparture: new Date(now + 8 * 60_000).toISOString(),
      track: "2",
      status: "in 8 Min",
      secondsLate: 0,
      stops: [
        { name: "Newark Penn Station", time: new Date(now + 8 * 60_000).toISOString(), departed: false, status: "OnTime" },
        { name: "New York Penn Station", time: new Date(now + 28 * 60_000).toISOString(), departed: false, status: "OnTime" },
      ],
    },
    {
      trainId: "3251",
      line: "Northeast Corrdr",
      destination: "Trenton",
      scheduledDeparture: new Date(now + 22 * 60_000).toISOString(),
      track: "",
      status: "in 22 Min",
      secondsLate: 0,
      stops: [
        { name: "Newark Penn Station", time: new Date(now + 22 * 60_000).toISOString(), departed: false, status: "OnTime" },
        { name: "New York Penn Station", time: new Date(now + 40 * 60_000).toISOString(), departed: false, status: "OnTime" },
      ],
    },
  ],
};

export default trainsMultiple;
