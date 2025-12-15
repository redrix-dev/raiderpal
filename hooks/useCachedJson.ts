"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cachedFetchJson,
  clearCachedEntry,
} from "@/lib/clientCache";
import type { ApiResponse } from "@/lib/http";
import type { Schema } from "@/lib/validation";

type UseCachedJsonOptions<T> = {
  version?: string | number;
  ttlMs?: number;
  initialData?: T;
  enabled?: boolean;
  disableCache?: boolean;
  responseSchema?: Schema<ApiResponse<T>>;
  dataSchema?: Schema<T>;
};

type RefetchOptions = {
  bustCache?: boolean;
};

/**
 * Thin wrapper around cachedFetchJson that tracks loading/error state
 * and allows optional cache busting.
 */
export function useCachedJson<T>(
  url: string | null,
  opts: UseCachedJsonOptions<T> = {}
) {
  const {
    version,
    ttlMs,
    initialData,
    enabled = true,
    disableCache,
    responseSchema,
    dataSchema,
  } = opts;

  const [data, setData] = useState<T | null>(initialData ?? null);
  const [loading, setLoading] = useState(initialData == null);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<T | null>(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const fetchJson = useCallback(
    async (options?: RefetchOptions) => {
      if (!url || !enabled) {
        return;
      }

      const shouldShowLoading = dataRef.current == null;
      if (shouldShowLoading) {
        setLoading(true);
      }
      setError(null);

      try {
        if (options?.bustCache) {
          clearCachedEntry(url);
        }
        const result = await cachedFetchJson<T>(url, {
          version,
          ttlMs,
          disableCache,
          responseSchema,
          dataSchema,
        });
        setData(result ?? null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error fetching data";
        setError(message);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [url, enabled, version, ttlMs, disableCache]
  );

  useEffect(() => {
    if (!url || !enabled) {
      setLoading(false);
      return;
    }
    setError(null);
    fetchJson();
  }, [url, version, enabled, fetchJson]);

  return { data, loading, error, refetch: fetchJson };
}
