// components/LongCacheToggle.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { OverlayShell } from "@/components/ui/OverlayShell";
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
      className={`inline-flex items-center gap-2 rounded-md border border-state-success/50 bg-state-success/25 px-3 h-9 text-xs sm:text-sm font-medium text-primary-invert ${className}`}
      aria-label="Long term caching is enabled"
      title="Long term caching is enabled"
    >
      <span className="h-2 w-2 rounded-full bg-state-success animate-pulse" aria-hidden />
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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

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
      if (typeof document !== "undefined") {
        lastFocusedRef.current = document.activeElement as HTMLElement | null;
      }
      closeButtonRef.current?.focus();
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      lastFocusedRef.current?.focus();
    }
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <OverlayShell
      onDismiss={onClose}
      alignment="center"
      zIndexClassName="z-50"
      viewportPaddingClassName="px-3 sm:px-6"
      containerClassName="max-w-lg"
      scrimClassName="bg-overlay-scrim"
    >
      <div
        className="rounded-2xl border border-border-strong bg-surface-card p-5 shadow-2xl backdrop-blur text-primary"
        role="dialog"
        aria-modal="true"
        aria-label="Long Term Caching settings"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="text-sm uppercase tracking-[0.08em] font-condensed text-primary">
              Long Term Caching
            </div>
            <p className="text-sm leading-relaxed text-primary">{INFO_TEXT}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            ref={closeButtonRef}
            className="rounded-full p-2 text-primary hover:text-primary-invert hover:bg-surface-base/80 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
            aria-label="Close settings"
          >
            X
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-border-strong bg-surface-panel px-4 py-3">
          <div className="space-y-1">
            <div className="text-sm font-condensed font-medium text-primary">
              Toggle long term caching
            </div>
            <div className="text-xs text-primary">
              {enabled ? "Currently enabled" : "Currently disabled"}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPreference(!enabled)}
            disabled={!ready}
            className={`relative inline-flex h-8 w-14 items-center rounded-full border p-0.5 transition-all duration-200 ease-in-out ${
              enabled
                ? "border-border-strong bg-brand-amber/60 justify-end"
                : "border-border-strong bg-surface-base/60 justify-start"
            } ${!ready ? "opacity-60 cursor-not-allowed" : "hover:border-brand-cyan"}`}
            aria-pressed={enabled}
            aria-label={enabled ? "Disable long term caching" : "Enable long term caching"}
          >
            <span
              className="h-5 w-5 rounded-full bg-primary-invert/90 shadow transition-all duration-500 ease-in-out"
            />
            <span className="sr-only">
              {enabled ? "Disable long term caching" : "Enable long term caching"}
            </span>
          </button>
        </div>
      </div>
    </OverlayShell>,
    document.body
  );
}
