import { useState } from "react";
import { api } from "../lib/api";
import { Card, CardTitle } from "./Card";

interface LogEntry {
  id: number;
  allowed: boolean;
  checked: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function RequestSimulator({ onRequest }: { onRequest: () => void }) {
  const [key, setKey] = useState("demo-user");
  const [count, setCount] = useState<number | "">(10);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);

  const fire = async () => {
    setRunning(true);
    setLog([]);
    const totalRequests =
      typeof count === "number" && count > 0 ? Math.min(count, 50) : 1;
    if (count === "" || count < 1 || count > 50) {
      setCount(totalRequests);
    }
    for (let i = 0; i < totalRequests; i++) {
      try {
        const res = await api.checkLimit(key);
        setLog((prev) => [...prev, { id: i, ...res }]);
        onRequest();
      } catch {
        break;
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    setRunning(false);
  };

  const runAllowed = log.filter((l) => l.allowed).length;
  const runDenied = log.filter((l) => !l.allowed).length;

  return (
    <Card>
      <CardTitle>Request Simulator</CardTitle>
      <div className="flex gap-2 mb-4">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="key"
          className="flex-1 px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
        />
        <input
          type="number"
          value={count}
          onChange={(e) => {
            const val = e.target.value;
            setCount(val === "" ? "" : Number(val));
          }}
          onBlur={() => {
            if (count === "" || count < 1) {
              setCount(1);
            } else if (count > 50) {
              setCount(50);
            }
          }}
          min={1}
          max={50}
          className="w-20 px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={fire}
          disabled={running}
          className="px-4 py-2 text-sm font-medium rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 disabled:opacity-50"
        >
          {running ? "Running..." : "Simulate"}
        </button>
      </div>

      {log.length > 0 && (
        <div className="flex items-center gap-4 mb-3 text-sm">
          <span className="text-neutral-500">This run:</span>
          <span className="text-green-600 dark:text-green-400 font-mono">
            {runAllowed} allowed
          </span>
          <span className="text-red-600 dark:text-red-400 font-mono">
            {runDenied} denied
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
        {log.map((entry) => (
          <div
            key={entry.id}
            title={`allowed=${entry.allowed} checked=${entry.checked} remaining=${entry.remaining} retryAfterMs=${entry.retryAfterMs}`}
            className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono cursor-default ${
              entry.allowed
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
            }`}
          >
            {entry.allowed ? "✓" : "✕"}
          </div>
        ))}
      </div>
    </Card>
  );
}
