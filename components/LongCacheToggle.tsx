// components/LongCacheToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { getLongCachePreference, setLongCachePreference } from "@/lib/clientCache";

export function LongCacheToggle() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEnabled(getLongCachePreference());
    setReady(true);
  }, []);

  function handleToggle(next: boolean) {
    setEnabled(next);
    setLongCachePreference(next);
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-3">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-100">
          Long Term Caching
        </h3>
        <p className="text-sm text-gray-400">
          If you find yourself using Raider Pal often, consider enabling Long
          Term Caching. This caches the data locally on your device when
          available for faster lookups and less impact on the database. It
          really helps if this little project catches on.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleToggle(!enabled)}
          disabled={!ready}
          className={`inline-flex items-center rounded-md px-3 py-2 text-sm transition ${
            enabled
              ? "border border-emerald-500/70 bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60"
              : "border border-slate-700 bg-slate-900/70 text-gray-200 hover:bg-slate-900"
          } ${!ready ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {enabled ? "Disable long term caching" : "Enable long term caching"}
        </button>
        <span className="text-xs text-gray-400">
          Status:{" "}
          <span className="text-gray-200">{enabled ? "Enabled" : "Disabled"}</span>
        </span>
      </div>
    </div>
  );
}
