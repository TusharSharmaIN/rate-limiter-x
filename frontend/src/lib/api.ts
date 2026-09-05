const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface HealthResponse {
  status: "ok" | "degraded";
  redis: { connected: boolean };
  failOpen: { totalFailOpenEvents: number; lastFailOpenAt: number | null };
  timestamp: string;
}

export interface StatsResponse {
  totalAllowed: number;
  totalDenied: number;
  totalRequests: number;
  perStrategy: Record<string, { allowed: number; denied: number }>;
}

export interface StrategyResponse {
  current: string;
  available: string[];
}

export interface CheckLimitResponse {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  checked: boolean;
}

export interface ConfigResponse {
  capacity: number;
  refillRatePerSec: number;
  windowSizeSec: number;
  leakRatePerSec: number;
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const api = {
  getHealth: () => fetchJson<HealthResponse>("/health"),
  getStats: () => fetchJson<StatsResponse>("/stats"),
  getStrategy: () => fetchJson<StrategyResponse>("/admin/strategy"),
  setStrategy: (strategy: string) =>
    fetchJson<{ success: boolean; current: string }>("/admin/strategy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategy }),
    }),
  checkLimit: (key: string) =>
    fetchJson<CheckLimitResponse>(
      `/check-limit?key=${encodeURIComponent(key)}`,
    ),
  getConfig: () => fetchJson<ConfigResponse>("/admin/config"),
  setConfig: (key: string, value: number) =>
    fetchJson<{ success: boolean }>("/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    }),
  resetStats: () =>
    fetchJson<{ success: boolean }>("/stats/reset", { method: "POST" }),
};

export const ALGORITHM_LABELS: Record<string, string> = {
  token_bucket: "Token Bucket",
  fixed_window: "Fixed Window",
  sliding_window_log: "Sliding Window Log",
  sliding_window_counter: "Sliding Window Counter",
  leaky_bucket: "Leaky Bucket",
};

export const ALGORITHM_PARAMS: Record<
  string,
  { key: keyof ConfigResponse; label: string }[]
> = {
  token_bucket: [
    { key: "capacity", label: "Capacity" },
    { key: "refillRatePerSec", label: "Refill Rate (tokens/sec)" },
  ],
  fixed_window: [
    { key: "capacity", label: "Capacity" },
    { key: "windowSizeSec", label: "Window Size (sec)" },
  ],
  sliding_window_log: [
    { key: "capacity", label: "Capacity" },
    { key: "windowSizeSec", label: "Window Size (sec)" },
  ],
  sliding_window_counter: [
    { key: "capacity", label: "Capacity" },
    { key: "windowSizeSec", label: "Window Size (sec)" },
  ],
  leaky_bucket: [
    { key: "capacity", label: "Capacity" },
    { key: "leakRatePerSec", label: "Leak Rate (units/sec)" },
  ],
};
