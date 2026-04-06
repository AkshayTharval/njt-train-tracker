export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Track your train</h2>
        <p className="text-gray-400 max-w-md">
          Select an origin and destination station to see live departures, track
          assignments, and current status — updated automatically.
        </p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-xl">
        <p className="text-gray-500 text-sm">Station selector coming in Phase 2</p>
      </div>
    </div>
  );
}
