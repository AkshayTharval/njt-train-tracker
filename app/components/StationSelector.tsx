"use client";

import { useCallback } from "react";
import type { Station } from "@/lib/types";

interface Props {
  stations: Station[];
  from: string;
  to: string;
  onFromChange: (code: string) => void;
  onToChange: (code: string) => void;
  disabled?: boolean;
}

export default function StationSelector({
  stations,
  from,
  to,
  onFromChange,
  onToChange,
  disabled = false,
}: Props) {
  const handleFrom = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onFromChange(e.target.value),
    [onFromChange]
  );
  const handleTo = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onToChange(e.target.value),
    [onToChange]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <label className="flex flex-col gap-1 flex-1">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">From</span>
        <select
          data-testid="select-from"
          value={from}
          onChange={handleFrom}
          disabled={disabled}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">Select origin station</option>
          {stations.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end pb-2.5 text-gray-600 font-bold text-lg select-none hidden sm:flex">
        →
      </div>

      <label className="flex flex-col gap-1 flex-1">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">To</span>
        <select
          data-testid="select-to"
          value={to}
          onChange={handleTo}
          disabled={disabled}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">Select destination station</option>
          {stations.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
