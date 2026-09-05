import { useState } from "react";
import { ThemeProvider, useTheme } from "./lib/theme";
import { StatusCard } from "./components/StatusCard";
import { StatsCard } from "./components/StatsCard";
import { AlgorithmSwitcher } from "./components/AlgorithmSwitcher";
import { ConfigPanel } from "./components/ConfigPanel";
import { RequestSimulator } from "./components/RequestSimulator";
import { useEffect } from "react";
import { api } from "./lib/api";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
    >
      {theme === "dark" ? (
        <svg
          className="w-4 h-4 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}

function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentStrategy, setCurrentStrategy] = useState<string | null>(null);

  useEffect(() => {
    api.getStrategy().then((res) => setCurrentStrategy(res.current));
  }, [refreshKey]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black transition-colors">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Rate Limiter
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Live demo &amp; simulator
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatusCard />
          <AlgorithmSwitcher onChange={() => setRefreshKey((k) => k + 1)} />
          <ConfigPanel
            currentStrategy={currentStrategy}
            onChange={() => setRefreshKey((k) => k + 1)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard
            refreshKey={refreshKey}
            onReset={() => setRefreshKey((k) => k + 1)}
          />
          <RequestSimulator onRequest={() => setRefreshKey((k) => k + 1)} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}
