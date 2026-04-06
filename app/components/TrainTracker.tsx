"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StationSelector from "./StationSelector";
import type { Station, TrainsResponse } from "@/lib/types";

interface Props {
  initialStations: Station[];
}

export default function TrainTracker({ initialStations }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  // Sync selections to URL so they persist on refresh
  const updateUrl = useCallback(
    (nextFrom: string, nextTo: string) => {
      const params = new URLSearchParams();
      if (nextFrom) params.set("from", nextFrom);
      if (nextTo) params.set("to", nextTo);
      const query = params.toString();
      router.replace(query ? `?${query}` : "/", { scroll: false });
    },
    [router]
  );

  const handleFromChange = useCallback(
    (code: string) => {
      setFrom(code);
      updateUrl(code, to);
    },
    [to, updateUrl]
  );

  const handleToChange = useCallback(
    (code: string) => {
      setTo(code);
      updateUrl(from, code);
    },
    [from, updateUrl]
  );

  const [trainsData, setTrainsData] = useState<TrainsResponse | null>(null);
  const [trainsError, setTrainsError] = useState<string | null>(null);
  const [trainsLoading, setTrainsLoading] = useState(false);

  const fetchTrains = useCallback(async () => {
    if (!from || !to) return;
    setTrainsLoading(true);
    setTrainsError(null);
    try {
      const res = await fetch(`/api/trains?from=${from}&to=${to}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const data: TrainsResponse = await res.json();
      setTrainsData(data);
    } catch (err) {
      setTrainsError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setTrainsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    if (from && to) {
      fetchTrains();
    } else {
      setTrainsData(null);
      setTrainsError(null);
    }
  }, [from, to, fetchTrains]);

  return (
    <div className="space-y-8">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <StationSelector
          stations={initialStations}
          from={from}
          to={to}
          onFromChange={handleFromChange}
          onToChange={handleToChange}
        />
      </div>

      {/* Placeholder for the train board — Phase 3 */}
      {from && to && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          {trainsLoading && (
            <p className="text-gray-400 text-sm text-center py-4">Loading trains…</p>
          )}
          {trainsError && !trainsLoading && (
            <div className="text-center py-4">
              <p className="text-red-400 text-sm">{trainsError}</p>
            </div>
          )}
          {trainsData && !trainsLoading && (
            <p className="text-gray-400 text-sm text-center py-4">
              Found {trainsData.trains.length} train(s) — Train board coming in Phase 3
            </p>
          )}
        </div>
      )}

      {!from && !to && (
        <p className="text-center text-gray-600 text-sm">
          Select an origin and destination to see departures.
        </p>
      )}
    </div>
  );
}
