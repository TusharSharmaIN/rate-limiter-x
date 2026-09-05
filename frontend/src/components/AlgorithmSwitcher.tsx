import { useEffect, useState } from "react";
import { api, ALGORITHM_LABELS } from "../lib/api";
import { Card, CardTitle } from "./Card";

export function AlgorithmSwitcher({ onChange }: { onChange: () => void }) {
  const [current, setCurrent] = useState<string | null>(null);
  const [available, setAvailable] = useState<string[]>([]);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    api.getStrategy().then((res) => {
      setCurrent(res.current);
      setAvailable(res.available);
    });
  }, []);

  const handleSwitch = async (name: string) => {
    setSwitching(true);
    await api.setStrategy(name);
    setCurrent(name);
    setSwitching(false);
    onChange();
  };

  return (
    <Card>
      <CardTitle>Algorithm</CardTitle>
      <div className="grid grid-cols-1 gap-2">
        {available.map((name) => (
          <button
            key={name}
            onClick={() => handleSwitch(name)}
            disabled={switching || name === current}
            className={`text-left px-3 py-2 rounded-md text-sm border transition-colors ${
              name === current
                ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 disabled:opacity-50"
            }`}
          >
            {ALGORITHM_LABELS[name] ?? name}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-400 mt-3">
        Switching resets tracking for new keys — each algorithm keeps
        independent state.
      </p>
    </Card>
  );
}
