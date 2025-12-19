"use client";

import { useEffect, useState } from "react";
import {
  getAppDataVersion,
  type VersionPayload,
} from "@/lib/appVersionClient";

type UseAppVersionOptions = {
  initialVersion?: number | string | null;
};

type UseAppVersionResult = {
  version: number | undefined;
  meta: VersionPayload | null;
  loading: boolean;
  error: string | null;
};

/**
 * Client-side helper to read the app data version (cached via /api/version).
 * Optionally accepts an initialVersion to use until the client fetch completes.
 */
export function useAppVersion(
  options: UseAppVersionOptions = {}
): UseAppVersionResult {
  const { initialVersion } = options;
  const [meta, setMeta] = useState<VersionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fallbackVersion = (() => {
    if (initialVersion == null || initialVersion === "") return undefined;
    const parsed = Number(initialVersion);
    return Number.isFinite(parsed) ? parsed : undefined;
  })();

  useEffect(() => {
    let cancelled = false;

    getAppDataVersion()
      .then((res) => {
        if (cancelled) return;
        setMeta(res);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load app version";
        setError(message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const version = meta?.version ?? fallbackVersion;

  return {
    version,
    meta,
    loading: !meta && !error,
    error,
  };
}
