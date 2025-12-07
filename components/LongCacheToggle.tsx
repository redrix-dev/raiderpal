// components/LongCacheToggle.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  getLongCachePreference,
  setLongCachePreference,
} from "@/lib/clientCache";

const INFO_TEXT =
  "If you find yourself using Raider Pal often, consider enabling Long Term Caching. This caches the data locally on your device when available for faster lookups and less impact on the database. It really helps if this little project catches on.";

const LONG_CACHE_EVENT = "rp-long-cache-changed";

function emitLongCacheChange(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LONG_CACHE_EVENT, { detail: enabled }));
}

export function useLongCachePreference() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEnabled(getLongCachePreference());
    setReady(true);
  }, []);

  useEffect(() => {
    function handle(event: Event) {
      const detail = (event as CustomEvent<boolean>).detail;
      setEnabled(detail);
    }
    window.addEventListener(LONG_CACHE_EVENT, handle as EventListener);
    return () => window.removeEventListener(LONG_CACHE_EVENT, handle as EventListener);
  }, []);

  const setPreference = useMemo(
    () => (next: boolean) => {
      setEnabled(next);
      setLongCachePreference(next);
      emitLongCacheChange(next);
    },
    []
  );

  return { enabled, ready, setPreference };
}

export function LongCacheIndicator({ className = "" }: { className?: string }) {
  const { enabled, ready } = useLongCachePreference();
  if (!ready || !enabled) return null;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border border-emerald-500/50 bg-emerald-900/30 px-3 h-9 text-xs sm:text-sm font-medium text-emerald-100 ${className}`}
      aria-label="Long term caching is enabled"
      title="Long term caching is enabled"
    >
      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
      LTC Enabled
    </span>
  );
}

export function LongCacheSettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { enabled, ready, setPreference } = useLongCachePreference();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 px-3 sm:px-6"
      onMouseDown={onClose}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative flex h-full items-center justify-center">
        <div
          className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950/95 p-5 shadow-2xl backdrop-blur"
          onMouseDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Long Term Caching settings"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.08em] text-slate-400">
                Long Term Caching
              </div>
              <p className="text-sm leading-relaxed text-slate-200">{INFO_TEXT}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Close settings"
            >
              X
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-100">
                Toggle long term caching
              </div>
              <div className="text-xs text-slate-400">
                {enabled ? "Currently enabled" : "Currently disabled"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreference(!enabled)}
              disabled={!ready}
              className={`relative inline-flex h-8 w-14 items-center rounded-full border transition ${
                enabled
                  ? "border-emerald-500/60 bg-emerald-900/60"
                  : "border-slate-700 bg-slate-900"
              } ${!ready ? "opacity-60 cursor-not-allowed" : "hover:border-slate-500"}`}
              aria-pressed={enabled}
              aria-label={enabled ? "Disable long term caching" : "Enable long term caching"}
            >
              <span
                className={`absolute h-5 w-5 rounded-full bg-white/90 shadow transform transition ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
              <span className="sr-only">
                {enabled ? "Disable long term caching" : "Enable long term caching"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
