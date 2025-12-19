/**
 * @fileoverview Client-side caching utility for Raider Pal
 *
 * Provides localStorage-backed JSON caching with TTL, versioning, and debug events.
 * Reduces API calls by caching responses and automatically invalidating stale data.
 * Includes development-only debug panel integration for cache monitoring.
 */

import { apiResponseSchema } from "@/lib/apiSchemas";
import { CACHE } from "@/lib/constants";
import { assertResponseShape, type ApiResponse } from "@/lib/http";
import type { Schema } from "@/lib/validation";

const CACHE_PREFIX = "rp_cache_v1:";
const LONG_CACHE_KEY = "rp_long_cache_enabled";

/**
 * Cache event types for debug monitoring
 */
type CacheEvent = {
  type: "HIT" | "MISS" | "EXPIRED" | "STORED" | "CLEARED";
  url: string;
  timestamp: number;
  meta?: Record<string, unknown>;
};

const cacheEvents: CacheEvent[] = [];

/**
 * Emits a cache event for debug monitoring (development only)
 * @param event - The cache event to emit
 */
function emitCacheEvent(event: CacheEvent) {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "development") return;

  cacheEvents.push(event);
  window.dispatchEvent(new CustomEvent("cache-debug", { detail: event }));
}

/**
 * Gets all cache events for debug display
 * @returns Array of cache events
 */
export function getCacheEvents() {
  if (typeof window === "undefined") return [];
  return cacheEvents;
}

/**
 * Clears the cache events log
 */
export function clearCacheEvents() {
  if (typeof window === "undefined") return;
  cacheEvents.length = 0;
}

/**
 * Options for cached fetch operations
 */
type CacheOptions<T> = {
  /** Time-to-live in milliseconds */
  ttlMs?: number;
  /** Version identifier for cache invalidation */
  version?: string | number;
  /** Skip caching entirely */
  disableCache?: boolean;
  /** Schema to validate the full API response */
  responseSchema?: Schema<ApiResponse<T>>;
  /** Schema to validate just the data portion */
  dataSchema?: Schema<T>;
};

/**
 * Cached entry structure stored in localStorage
 */
type CachedEntry<T> = {
  ts: number;
  data: T;
  version?: string | number;
};

/**
 * Generates a unique cache key for a URL and version
 * @param url - The URL being cached
 * @param version - Optional version identifier
 * @returns Cache key string
 */
function getCacheKey(url: string, version?: string | number) {
  // Version becomes part of the key, so a version bump guarantees a new fetch.
  const v = version === undefined ? "nov" : String(version);
  return `${CACHE_PREFIX}${v}:${url}`;
}

/**
 * Reads a cached entry from localStorage
 * @param key - Cache key to read
 * @returns Parsed cache entry or null if not found/invalid
 */
function readCache<T>(key: string): CachedEntry<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CachedEntry<T>;
  } catch {
    return null;
  }
}

/**
 * Gets all cache keys sorted by access time (oldest first)
 * @returns Array of cache keys sorted by timestamp
 */
function getCacheKeysByAge(): Array<{ key: string; ts: number }> {
  if (typeof window === "undefined") return [];
  const entries: Array<{ key: string; ts: number }> = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const entry = JSON.parse(raw) as CachedEntry<unknown>;
            entries.push({ key, ts: entry.ts });
          }
        } catch {
          // Skip invalid entries
        }
      }
    }
  } catch {
    return [];
  }

  // Sort by timestamp ascending (oldest first)
  entries.sort((a, b) => a.ts - b.ts);
  return entries;
}

/**
 * Evicts the oldest cache entries to free up space
 * @param minToEvict - Minimum number of entries to evict
 */
function evictOldestEntries(minToEvict: number = 5) {
  if (typeof window === "undefined") return;

  const entries = getCacheKeysByAge();
  const toEvict = Math.max(minToEvict, Math.floor(entries.length * 0.2)); // Evict at least 20% or minToEvict

  for (let i = 0; i < toEvict && i < entries.length; i++) {
    try {
      localStorage.removeItem(entries[i].key);
      emitCacheEvent({
        type: "CLEARED",
        url: entries[i].key,
        timestamp: Date.now(),
        meta: { reason: "quota-eviction" },
      });
    } catch {
      // Continue evicting even if one fails
    }
  }
}

/**
 * Writes a cache entry to localStorage with LRU eviction on quota exceeded
 * @param key - Cache key to write
 * @param value - Cache entry to store
 */
function writeCache<T>(key: string, value: CachedEntry<T>) {
  if (typeof window === "undefined") return;

  let retries = 0;
  const maxRetries = 2;

  while (retries <= maxRetries) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return; // Success
    } catch (error) {
      // Check if it's a quota exceeded error
      const isQuotaError =
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" ||
          error.name === "NS_ERROR_DOM_QUOTA_REACHED");

      if (isQuotaError && retries < maxRetries) {
        // Try evicting old entries and retry
        evictOldestEntries(5);
        retries++;
      } else {
        // Either not a quota error, or we've exhausted retries
        if (process.env.NODE_ENV === "development") {
          console.warn(`Failed to write cache entry for ${key}:`, error);
        }
        return;
      }
    }
  }
}

/**
 * Checks if user prefers long cache durations
 * @returns True if long cache is enabled
 */
function prefersLongCache(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LONG_CACHE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Coerces unknown payload into API response format
 * @param payload - Raw response payload
 * @returns Parsed API response
 * @throws Error if payload doesn't match expected format
 */
function coerceApiResponse<T>(payload: unknown): ApiResponse<T> {
  if (payload && typeof payload === "object" && "success" in payload) {
    const { success, data } = payload as { success: unknown; data?: unknown };
    if (success === true) {
      return { success: true, data: data as T };
    }
    if (success === false) {
      const err = (payload as { error?: unknown }).error;
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        "message" in err
      ) {
        const code = (err as { code?: unknown }).code;
        const message = (err as { message?: unknown }).message;
        return {
          success: false,
          error: {
            code: typeof code === "string" ? code : "error",
            message: typeof message === "string" ? message : "Request failed",
          },
        };
      }
      if (typeof err === "string") {
        return {
          success: false,
          error: { code: "error", message: err },
        };
      }
      return {
        success: false,
        error: { code: "error", message: "Request failed" },
      };
    }
  }
  throw new Error("Invalid API response envelope");
}

/**
 * Fetches JSON data with intelligent caching
 *
 * Automatically caches responses in localStorage with TTL and version support.
 * Handles API response validation and cache invalidation.
 *
 * @param url - URL to fetch
 * @param opts - Caching and validation options
 * @returns Promise resolving to the fetched/validated data
 */
export async function cachedFetchJson<T>(
  url: string,
  opts: CacheOptions<T> = {}
): Promise<T> {
  const { ttlMs, version, disableCache, responseSchema, dataSchema } = opts;
  const envelopeSchema =
    responseSchema || (dataSchema ? apiResponseSchema(dataSchema) : undefined);
  const effectiveTtl =
    ttlMs ?? (prefersLongCache() ? CACHE.LONG_TTL_MS : CACHE.DEFAULT_TTL_MS);
  const key = getCacheKey(url, version);

  if (!disableCache) {
    const cached = readCache<T>(key);
    const stillValid =
      cached &&
      (effectiveTtl === Infinity || Date.now() - cached.ts < effectiveTtl);
    if (stillValid) {
      const age = Date.now() - cached.ts;
      emitCacheEvent({
        type: "HIT",
        url,
        timestamp: Date.now(),
        meta: {
          age: `${Math.round(age / 1000)}s`,
          ttl: effectiveTtl === Infinity ? "inf" : `${Math.round(effectiveTtl / 1000)}s`,
          version: version ?? "none",
        },
      });
      return cached.data;
    }

    if (cached) {
      emitCacheEvent({
        type: "EXPIRED",
        url,
        timestamp: Date.now(),
        meta: {
          age: `${Math.round((Date.now() - cached.ts) / 1000)}s`,
          ttl: effectiveTtl === Infinity ? "inf" : `${Math.round(effectiveTtl / 1000)}s`,
        },
      });
    }
  }

  emitCacheEvent({
    type: "MISS",
    url,
    timestamp: Date.now(),
    meta: {
      reason: disableCache ? "disabled" : "not found",
      version: version ?? "none",
    },
  });

  const res = await fetch(url, disableCache ? { cache: "no-store" } : undefined);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const rawPayload = (await res.json()) as unknown;

  const parsedEnvelope = envelopeSchema
    ? assertResponseShape(envelopeSchema, rawPayload)
    : coerceApiResponse<T>(rawPayload);

  if (!parsedEnvelope.success) {
    throw new Error(parsedEnvelope.error.message);
  }

  const shouldValidateData = Boolean(dataSchema) && !envelopeSchema;
  const parsedData =
    shouldValidateData && dataSchema
      ? assertResponseShape(dataSchema, parsedEnvelope.data)
      : parsedEnvelope.data;

  if (!disableCache) {
    writeCache(key, { ts: Date.now(), data: parsedData, version });
    emitCacheEvent({
      type: "STORED",
      url,
      timestamp: Date.now(),
      meta: { version: version ?? "none" },
    });
  }
  return parsedData;
}

/**
 * Sets the user's long cache preference
 * @param enabled - Whether to enable long cache durations
 */
export function setLongCachePreference(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (enabled) {
      localStorage.setItem(LONG_CACHE_KEY, "1");
    } else {
      localStorage.removeItem(LONG_CACHE_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Gets the current long cache preference
 * @returns True if long cache is enabled
 */
export function getLongCachePreference(): boolean {
  return prefersLongCache();
}

/**
 * Clears a specific cached entry or all versions of a URL
 * @param url - URL to clear from cache
 * @param version - Specific version to clear (clears all if undefined)
 */
export function clearCachedEntry(url: string, version?: string | number) {
  if (typeof window === "undefined") return;
  try {
    if (version !== undefined) {
      const key = getCacheKey(url, version);
      localStorage.removeItem(key);
    }

    const novKey = getCacheKey(url, undefined);
    localStorage.removeItem(novKey);

    const prefix = `${CACHE_PREFIX}`;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.includes(url) && k.startsWith(prefix)) {
        localStorage.removeItem(k);
      }
    }

    emitCacheEvent({
      type: "CLEARED",
      url,
      timestamp: Date.now(),
      meta: { version: version ?? "all" },
    });
  } catch {
    // ignore
  }
}

/**
 * Gets statistics about the current cache state
 * @returns Cache statistics or null if unavailable
 */
export function getCacheStats() {
  if (typeof window === "undefined") return null;

  let totalEntries = 0;
  let totalSize = 0;
  let oldestEntry = Infinity;
  let newestEntry = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        totalEntries++;
        const raw = localStorage.getItem(key);
        if (raw) {
          totalSize += raw.length;
          const entry = JSON.parse(raw) as CachedEntry<unknown>;
          oldestEntry = Math.min(oldestEntry, entry.ts);
          newestEntry = Math.max(newestEntry, entry.ts);
        }
      }
    }

    return {
      totalEntries,
      totalSizeKB: Math.round(totalSize / 1024),
      oldestEntryAgo: Date.now() - oldestEntry,
      newestEntryAgo: Date.now() - newestEntry,
    };
  } catch {
    return null;
  }
}
