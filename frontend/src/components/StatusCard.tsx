import { useEffect, useState } from "react";
import { api, type HealthResponse } from "../lib/api";
import { Card, CardTitle } from "./Card";
import { Badge } from "./Badge";

export function StatusCard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const poll = () =>
      api
        .getHealth()
        .then(setHealth)
        .catch(() => setError(true));
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardTitle>Service Status</CardTitle>
      {error && <Badge variant="error">Unreachable</Badge>}
      {!error && !health && (
        <div className="text-sm text-neutral-400">Loading...</div>
      )}
      {health && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Overall
            </span>
            <Badge variant={health.status === "ok" ? "success" : "error"}>
              {health.status === "ok" ? "Operational" : "Degraded"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Redis
            </span>
            <Badge variant={health.redis.connected ? "success" : "error"}>
              {health.redis.connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Fail-open events
            </span>
            <span className="text-sm font-mono text-neutral-900 dark:text-neutral-100">
              {health.failOpen.totalFailOpenEvents}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
