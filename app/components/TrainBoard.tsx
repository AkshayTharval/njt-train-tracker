"use client";

import type { Train, TrainsResponse } from "@/lib/types";

interface Props {
  data: TrainsResponse;
  from: string;
  to: string;
}

function formatTime(isoOrNjt: string): string {
  // Handle both ISO strings and NJT date strings like "04-Apr-2026 08:15:00 AM"
  const d = new Date(isoOrNjt);
  if (isNaN(d.getTime())) return isoOrNjt;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function StatusBadge({ train }: { train: Train }) {
  const isDelayed = train.secondsLate > 0;
  const statusLower = train.status.toLowerCase();
  const isDeparted =
    statusLower.includes("departed") ||
    statusLower.includes("arrived") ||
    train.stops[0]?.departed;

  if (isDeparted) {
    return (
      <span className="inline-flex items-center gap-1 text-gray-500 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-gray-600" />
        Departed
      </span>
    );
  }

  if (isDelayed) {
    const mins = Math.round(train.secondsLate / 60);
    return (
      <span className="inline-flex items-center gap-1 text-amber-400 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        LATE {mins} min
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium">
      <span className="w-2 h-2 rounded-full bg-emerald-400" />
      {train.status}
    </span>
  );
}

function TrainRow({ train }: { train: Train }) {
  const isDelayed = train.secondsLate > 0;
  const statusLower = train.status.toLowerCase();
  const isDeparted =
    statusLower.includes("departed") ||
    statusLower.includes("arrived") ||
    train.stops[0]?.departed;

  return (
    <tr
      data-testid="train-row"
      data-delayed={isDelayed}
      className={[
        "border-b border-gray-800 transition-colors",
        isDeparted ? "opacity-50" : "hover:bg-gray-800/50",
        isDelayed && !isDeparted ? "bg-amber-950/20" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-200 whitespace-nowrap">
        #{train.trainId}
      </td>
      <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">{train.line}</td>
      <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">→ {train.destination}</td>
      <td className="px-4 py-3 font-mono text-sm text-gray-200 whitespace-nowrap">
        {formatTime(train.scheduledDeparture)}
      </td>
      <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
        {train.track ? (
          <span className="inline-block bg-blue-900/50 border border-blue-700 text-blue-300 rounded px-2 py-0.5 text-xs font-mono font-semibold">
            {train.track}
          </span>
        ) : (
          <span className="text-gray-600 text-xs">TBD</span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge train={train} />
      </td>
    </tr>
  );
}

export default function TrainBoard({ data, from, to }: Props) {
  if (data.fullScreenMessage) {
    return (
      <div
        data-testid="fullscreen-message"
        className="rounded-xl bg-yellow-950/40 border border-yellow-800 p-6 text-center"
      >
        <p className="text-yellow-300 font-medium text-sm mb-1">Service Alert</p>
        <p className="text-yellow-200/80 text-sm">{data.fullScreenMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.bannerMessage && (
        <div
          data-testid="banner-message"
          className="rounded-lg bg-blue-950/40 border border-blue-800 px-4 py-2.5 text-blue-300 text-sm"
        >
          {data.bannerMessage}
        </div>
      )}

      {data.trains.length === 0 ? (
        <div
          data-testid="no-trains"
          className="text-center py-10 text-gray-500 text-sm"
        >
          No trains found between {from} and {to}. Check back later.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Train
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Line
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  To
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Departs
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide text-center">
                  Track
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900/50">
              {data.trains.map((train) => (
                <TrainRow key={train.trainId} train={train} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
