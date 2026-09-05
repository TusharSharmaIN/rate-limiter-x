import { useEffect, useState } from "react";
import { api, type ConfigResponse, ALGORITHM_PARAMS } from "../lib/api";
import { Card, CardTitle } from "./Card";

export function ConfigPanel({
  currentStrategy,
  onChange,
}: {
  currentStrategy: string | null;
  onChange: () => void;
}) {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    api.getConfig().then(setConfig);
  }, [currentStrategy]);

  if (!currentStrategy || !config) {
    return (
      <Card>
        <CardTitle>Parameters</CardTitle>
        <div className="text-sm text-neutral-400">Loading...</div>
      </Card>
    );
  }

  const params = ALGORITHM_PARAMS[currentStrategy] ?? [];

  const handleSave = async (key: string, value: number) => {
    setSaving(key);
    await api.setConfig(key, value);
    setSaving(null);
    onChange();
  };

  return (
    <Card>
      <CardTitle>Parameters</CardTitle>
      <div className="space-y-4">
        {params.map(({ key, label }) => (
          <div key={key}>
            <label className="text-sm text-neutral-600 dark:text-neutral-400 block mb-1.5">
              {label}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                defaultValue={config[key]}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val !== config[key]) handleSave(key, val);
                }}
                className="flex-1 px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
              />
              {saving === key && (
                <span className="text-xs text-neutral-400 self-center">
                  saving...
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-400 mt-4">
        Changes apply immediately to new requests.
      </p>
    </Card>
  );
}
