import { NextRequest, NextResponse } from "next/server";
import type { TrainsResponse } from "@/lib/types";

const USE_MOCK = process.env.USE_MOCK_API === "true";
const NJT_BASE = "http://traindata.njtransit.com:8092/NJTTrainData.asmx";

export async function GET(
  req: NextRequest
): Promise<NextResponse<TrainsResponse | { error: string }>> {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from")?.toUpperCase();
  const to = searchParams.get("to")?.toUpperCase();
  // Optional: scenario override for mock testing (e.g. ?scenario=delayed)
  const scenario = searchParams.get("scenario") ?? "multipleTrains";

  if (!from || !to) {
    return NextResponse.json({ error: "Missing required params: from, to" }, { status: 400 });
  }
  if (from === to) {
    return NextResponse.json({ error: "Origin and destination must be different." }, { status: 400 });
  }

  const { parseScheduleResponse } = await import("@/lib/njt/transforms");

  try {
    let rawData: unknown;

    if (USE_MOCK) {
      const { getMockSchedule } = await import("@/lib/mock/trains");
      rawData = getMockSchedule(from, scenario as Parameters<typeof getMockSchedule>[1]);
    } else {
      const username = process.env.NJT_USERNAME;
      const password = process.env.NJT_PASSWORD;
      if (!username || !password) {
        return NextResponse.json(
          { error: "NJT credentials not configured. Set NJT_USERNAME and NJT_PASSWORD." },
          { status: 500 }
        );
      }

      const url = `${NJT_BASE}/getTrainScheduleJSON?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&station=${encodeURIComponent(from)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`NJT API returned ${res.status}`);
      rawData = await res.json();
    }

    const result = parseScheduleResponse(rawData, from, to);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/trains]", err);
    return NextResponse.json(
      { error: "Failed to fetch train schedule. Please try again." },
      { status: 500 }
    );
  }
}
