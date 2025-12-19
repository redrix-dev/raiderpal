/**
 * @fileoverview React hook for cached JSON fetching
 *
 * Provides a React-friendly interface to the client cache system with loading states,
 * error handling, and cache management. Automatically handles data fetching on mount
 * and provides refetch capabilities.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cachedFetchJson,
  clearCachedEntry,
} from "@/lib/clientCache";
import type { ApiResponse } from "@/lib/http";
import type { Schema } from "@/lib/validation";

/**
 * Options for configuring the cached JSON hook
 */
type UseCachedJsonOptions<T> = {
  /** Version identifier for cache invalidation */
  version?: string | number;
  /** Time-to-live in milliseconds */
  ttlMs?: number;
  /** Initial data to display before fetch completes */
  initialData?: T;
  /** Whether to enable the hook (default: true) */
  enabled?: boolean;
  /** Skip caching entirely */
  disableCache?: boolean;
  /** Schema to validate the full API response */
  responseSchema?: Schema<ApiResponse<T>>;
  /** Schema to validate just the data portion */
  dataSchema?: Schema<T>;
};

/**
 * Options for refetching data
 */
type RefetchOptions = {
  /** Clear cache before refetching */
  bustCache?: boolean;
};

/**
 * React hook for fetching and caching JSON data
 *
 * Manages loading states, error handling, and cache invalidation for API calls.
 * Automatically fetches on mount and provides manual refetch capabilities.
 *
 * @param url - API endpoint URL to fetch from (null disables the hook)
 * @param opts - Configuration options for fetching and caching
 * @returns Object with data, loading state, error, and refetch function
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

  /**
   * Fetches JSON data with optional cache busting
   * @param options - Refetch configuration options
   */
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
    [url, enabled, version, ttlMs, disableCache, responseSchema, dataSchema]
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
