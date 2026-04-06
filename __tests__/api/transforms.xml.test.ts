// Integration-style tests for the XML parsing path used by the real NJT API.
// These test that parseStationListResponse correctly handles fast-xml-parser output.

import { describe, it, expect } from "vitest";
import { XMLParser } from "fast-xml-parser";
import { parseStationListResponse } from "@/lib/njt/transforms";

const SAMPLE_STATION_XML = `<?xml version="1.0" encoding="utf-8"?>
<STATIONLIST>
  <STATION>
    <STATION_2CHAR>NY</STATION_2CHAR>
    <STATIONNAME>New York Penn Station</STATIONNAME>
  </STATION>
  <STATION>
    <STATION_2CHAR>NP</STATION_2CHAR>
    <STATIONNAME>Newark Penn Station</STATIONNAME>
  </STATION>
  <STATION>
    <STATION_2CHAR>TR</STATION_2CHAR>
    <STATIONNAME>Trenton</STATIONNAME>
  </STATION>
</STATIONLIST>`;

const SINGLE_STATION_XML = `<?xml version="1.0" encoding="utf-8"?>
<STATIONLIST>
  <STATION>
    <STATION_2CHAR>NP</STATION_2CHAR>
    <STATIONNAME>Newark Penn Station</STATIONNAME>
  </STATION>
</STATIONLIST>`;

describe("parseStationListResponse with real XML input", () => {
  const parser = new XMLParser();

  it("parses multi-station XML correctly", () => {
    const parsed = parser.parse(SAMPLE_STATION_XML);
    const stations = parseStationListResponse(parsed);

    expect(stations).toHaveLength(3);
    // Sorted alphabetically: "New York" < "Newark" < "Trenton"
    expect(stations[0].name).toBe("New York Penn Station");
    expect(stations[0].code).toBe("NY");
    expect(stations[1].name).toBe("Newark Penn Station");
    expect(stations[1].code).toBe("NP");
    expect(stations[2].name).toBe("Trenton");
    expect(stations[2].code).toBe("TR");
  });

  it("parses single-station XML (fast-xml-parser returns object, not array)", () => {
    const parsed = parser.parse(SINGLE_STATION_XML);
    // fast-xml-parser returns a single object for one child element
    const stations = parseStationListResponse(parsed);

    expect(stations).toHaveLength(1);
    expect(stations[0].code).toBe("NP");
    expect(stations[0].name).toBe("Newark Penn Station");
  });

  it("trims whitespace from codes and names", () => {
    const xml = `<STATIONLIST><STATION><STATION_2CHAR> NP </STATION_2CHAR><STATIONNAME>  Newark Penn Station  </STATIONNAME></STATION></STATIONLIST>`;
    const parsed = parser.parse(xml);
    const stations = parseStationListResponse(parsed);
    expect(stations[0].code).toBe("NP");
    expect(stations[0].name).toBe("Newark Penn Station");
  });
});
