"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StationSelector from "./StationSelector";
import TrainBoard from "./TrainBoard";
import type { Station, TrainsResponse } from "@/lib/types";

const REFRESH_INTERVAL_MS = 30_000;

interface Props {
  initialStations: Station[];
}

function BoardSkeleton() {
  return (
    <div data-testid="board-skeleton" className="rounded-xl border border-gray-800 overflow-hidden animate-pulse">
      <div className="bg-gray-900 h-10" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-800 bg-gray-900/50">
          <div className="h-4 w-12 bg-gray-800 rounded" />
          <div className="h-4 w-24 bg-gray-800 rounded" />
          <div className="h-4 w-20 bg-gray-800 rounded" />
          <div className="h-4 w-16 bg-gray-800 rounded" />
          <div className="h-4 w-8 bg-gray-800 rounded" />
          <div className="h-4 w-20 bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  );
}

function formatUpdatedAt(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
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
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);

  // Keep a stable ref to from/to so the interval callback doesn't go stale
  const fromRef = useRef(from);
  const toRef = useRef(to);
  useEffect(() => { fromRef.current = from; }, [from]);
  useEffect(() => { toRef.current = to; }, [to]);

  const fetchTrains = useCallback(async (isBackground = false) => {
    const currentFrom = fromRef.current;
    const currentTo = toRef.current;
    if (!currentFrom || !currentTo) return;

    if (!isBackground) setTrainsError(null);

    try {
      const res = await fetch(`/api/trains?from=${currentFrom}&to=${currentTo}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const data: TrainsResponse = await res.json();
      setTrainsData(data);
      setLastUpdated(new Date());
      setIsStale(false);
      if (!isBackground) setTrainsError(null);
    } catch (err) {
      if (isBackground) {
        // Keep existing data but flag it as stale
        setIsStale(true);
      } else {
        setTrainsError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      if (!isBackground) setIsFirstLoad(false);
    }
  }, []);

  // Initial fetch + reset when stations change
  useEffect(() => {
    if (from && to) {
      setIsFirstLoad(true);
      setIsStale(false);
      setLastUpdated(null);
      fetchTrains(false);
    } else {
      setTrainsData(null);
      setTrainsError(null);
      setIsFirstLoad(false);
      setLastUpdated(null);
      setIsStale(false);
    }
  }, [from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh interval
  useEffect(() => {
    if (!from || !to) return;
    const id = setInterval(() => fetchTrains(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [from, to, fetchTrains]);

  const showBoard = from && to;

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

      {showBoard && (
        <section aria-label="Train departures">
          {/* Status bar: last updated + stale warning */}
          {!isFirstLoad && (
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs text-gray-600">
                Auto-refreshes every {REFRESH_INTERVAL_MS / 1000}s
              </p>
              <div className="flex items-center gap-2">
                {isStale && (
                  <span
                    data-testid="stale-warning"
                    className="text-xs text-amber-500 font-medium"
                  >
                    Refresh failed — showing last data
                  </span>
                )}
                {lastUpdated && (
                  <span
                    data-testid="last-updated"
                    className="text-xs text-gray-600"
                  >
                    Updated {formatUpdatedAt(lastUpdated)}
                  </span>
                )}
              </div>
            </div>
          )}

          {isFirstLoad ? (
            <BoardSkeleton />
          ) : trainsError ? (
            <div
              data-testid="trains-error"
              className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-center"
            >
              <p className="text-red-400 font-medium mb-1">Could not load departures</p>
              <p className="text-red-300/70 text-sm">{trainsError}</p>
            </div>
          ) : trainsData ? (
            <TrainBoard data={trainsData} from={from} to={to} />
          ) : null}
        </section>
      )}

      {!showBoard && (
        <p className="text-center text-gray-600 text-sm pt-8">
          Select an origin and destination above to see upcoming departures.
        </p>
      )}
    </div>
  );
}
