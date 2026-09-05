import { Card, CardTitle } from "./Card";
import { api, type StatsResponse, ALGORITHM_LABELS } from "../lib/api";
import { useEffect, useState } from "react";

export function StatsCard({
  refreshKey,
  onReset,
}: {
  refreshKey: number;
  onReset: () => void;
}) {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    const poll = () =>
      api
        .getStats()
        .then(setStats)
        .catch(() => {});
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleReset = async () => {
    await api.resetStats();
    onReset();
  };

  if (!stats)
    return (
      <Card>
        <CardTitle>Live Stats</CardTitle>
        <div className="text-sm text-neutral-400">Loading...</div>
      </Card>
    );

  const denyRate =
    stats.totalRequests > 0
      ? ((stats.totalDenied / stats.totalRequests) * 100).toFixed(1)
      : "0.0";

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wide">
          All-time Stats
        </h2>
        <button
          onClick={handleReset}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          Reset
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
            {stats.totalRequests}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Total</div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-green-600 dark:text-green-400 font-mono">
            {stats.totalAllowed}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Allowed</div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-red-600 dark:text-red-400 font-mono">
            {stats.totalDenied}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Denied ({denyRate}%)
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {Object.entries(stats.perStrategy).map(([name, s]) => (
          <div key={name} className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">
              {ALGORITHM_LABELS[name] ?? name}
            </span>
            <span className="font-mono text-neutral-900 dark:text-neutral-100">
              <span className="text-green-600 dark:text-green-400">
                {s.allowed}
              </span>
              {" / "}
              <span className="text-red-600 dark:text-red-400">{s.denied}</span>
            </span>
          </div>
        ))}
        {Object.keys(stats.perStrategy).length === 0 && (
          <div className="text-sm text-neutral-400">No requests yet</div>
        )}
      </div>
    </Card>
  );
}
