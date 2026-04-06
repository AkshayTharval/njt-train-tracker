import { NextResponse } from "next/server";
import type { StationsResponse } from "@/lib/types";

const USE_MOCK = process.env.USE_MOCK_API === "true";
const NJT_BASE = "http://traindata.njtransit.com:8092/NJTTrainData.asmx";

export async function GET(): Promise<NextResponse<StationsResponse | { error: string }>> {
  try {
    if (USE_MOCK) {
      const { MOCK_STATIONS } = await import("@/lib/mock/stations");
      return NextResponse.json({ stations: MOCK_STATIONS });
    }

    const username = process.env.NJT_USERNAME;
    const password = process.env.NJT_PASSWORD;
    if (!username || !password) {
      return NextResponse.json(
        { error: "NJT credentials not configured. Set NJT_USERNAME and NJT_PASSWORD." },
        { status: 500 }
      );
    }

    const url = `${NJT_BASE}/getStationListXML?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h — stations rarely change
    if (!res.ok) throw new Error(`NJT API returned ${res.status}`);

    const xml = await res.text();
    const { XMLParser } = await import("fast-xml-parser");
    const parser = new XMLParser();
    const parsed = parser.parse(xml);
    const { parseStationListResponse } = await import("@/lib/njt/transforms");
    const stations = parseStationListResponse(parsed);

    return NextResponse.json({ stations });
  } catch (err) {
    console.error("[/api/stations]", err);
    return NextResponse.json(
      { error: "Failed to load station list. Please try again." },
      { status: 500 }
    );
  }
}
