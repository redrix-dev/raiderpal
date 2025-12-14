// lib/clientCache.ts
// Simple localStorage-backed JSON fetch cache to reduce repeat hits on API routes.

const CACHE_PREFIX = "rp_cache_v1:";
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const LONG_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const LONG_CACHE_KEY = "rp_long_cache_enabled";

type CacheOptions = {
  ttlMs?: number;
  version?: string | number;
  disableCache?: boolean;
};

type CachedEntry<T> = {
  ts: number;
  data: T;
  version?: string | number;
};

function getCacheKey(url: string) {
  return `${CACHE_PREFIX}${url}`;
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

export async function cachedFetchJson<T>(
  url: string,
  opts: CacheOptions = {}
): Promise<T> {
  const { ttlMs, version, disableCache } = opts;
  const effectiveTtl =
    ttlMs ?? (prefersLongCache() ? LONG_TTL_MS : DEFAULT_TTL_MS);
  const key = getCacheKey(url);

  if (!disableCache) {
    const cached = readCache<T>(key);
    const stillValid =
      cached &&
      Date.now() - cached.ts < effectiveTtl &&
      (version === undefined || cached.version === version);

    if (stillValid && cached) {
      return cached.data;
    }
  }

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  const data = (await res.json()) as T;

  if (!disableCache) {
    writeCache(key, { ts: Date.now(), data, version });
  }
  return data;
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
    localStorage.removeItem(getCacheKey(url));
  } catch {
    // ignore
  }
}
