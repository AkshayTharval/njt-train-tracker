import { Suspense } from "react";
import TrainTracker from "./components/TrainTracker";
import type { StationsResponse } from "@/lib/types";

async function getStations() {
  // Called server-side at render time — uses absolute URL for self-calls in Next.js
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const res = await fetch(`${baseUrl}/api/stations`, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data: StationsResponse = await res.json();
  return data.stations ?? [];
}

export default async function Home() {
  const stations = await getStations();

  return (
    <Suspense>
      <TrainTracker initialStations={stations} />
    </Suspense>
  );
}
