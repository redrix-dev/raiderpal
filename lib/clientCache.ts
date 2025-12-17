// lib/clientCache.ts
// Simple localStorage-backed JSON fetch cache to reduce repeat hits on API routes.

import { apiResponseSchema } from "@/lib/apiSchemas";
import { assertResponseShape, type ApiResponse } from "@/lib/http";
import type { Schema } from "@/lib/validation";

const CACHE_PREFIX = "rp_cache_v1:";
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const LONG_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const LONG_CACHE_KEY = "rp_long_cache_enabled";

type CacheOptions<T> = {
  ttlMs?: number;
  version?: string | number;
  disableCache?: boolean;
  responseSchema?: Schema<ApiResponse<T>>;
  dataSchema?: Schema<T>;
};

type CachedEntry<T> = {
  ts: number;
  data: T;
  version?: string | number;
};

function getCacheKey(url: string, version?: string | number) {
  // Version becomes part of the key, so a version bump guarantees a new fetch.
  const v = version === undefined ? "nov" : String(version);
  return `${CACHE_PREFIX}${v}:${url}`;
}

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

function writeCache<T>(key: string, value: CachedEntry<T>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Swallow errors (storage full / disabled)
  }
}

function prefersLongCache(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LONG_CACHE_KEY) === "1";
  } catch {
    return false;
  }
}

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

export async function cachedFetchJson<T>(
  url: string,
  opts: CacheOptions<T> = {}
): Promise<T> {
  const { ttlMs, version, disableCache, responseSchema, dataSchema } = opts;
  const envelopeSchema =
    responseSchema || (dataSchema ? apiResponseSchema(dataSchema) : undefined);
  const effectiveTtl =
    ttlMs ?? (prefersLongCache() ? LONG_TTL_MS : DEFAULT_TTL_MS);
  const key = getCacheKey(url, version);

  if (!disableCache) {
    const cached = readCache<T>(key);
    const stillValid = cached && Date.now() - cached.ts < effectiveTtl;
    if (stillValid) return cached.data;
  }

  const res = await fetch(url, { cache: "no-store" });
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
  }
  return parsedData;
}

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

export function getLongCachePreference(): boolean {
  return prefersLongCache();
}

export function clearCachedEntry(url: string) {
  if (typeof window === "undefined") return;
  try {
    // Remove any cached entries for this URL regardless of version
    const prefix = `${CACHE_PREFIX}`;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix) && k.endsWith(`:${url}`)) {
        localStorage.removeItem(k);
      }
    }
  } catch {
    // ignore
  }
}
