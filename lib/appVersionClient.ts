"use client";

import { cachedFetchJson } from "@/lib/clientCache";

export type AppVersionMeta = {
  version: number;
  last_synced_at: string | null;
};

const VERSION_TTL_MS = 60_000;
const MEMO_WINDOW_MS = 60_000;

let memoized: Promise<AppVersionMeta> | null = null;
let memoizedAt = 0;

/**
 * Fetches the current app data version from /api/version.
 * Results are memoized briefly in-memory and cached in localStorage
 * to avoid redundant network calls during a session.
 */
export async function getAppDataVersion(): Promise<AppVersionMeta> {
  const now = Date.now();
  if (memoized && now - memoizedAt < MEMO_WINDOW_MS) {
    return memoized;
  }

  memoizedAt = now;
  memoized = cachedFetchJson<AppVersionMeta>("/api/version", {
    ttlMs: VERSION_TTL_MS,
  });

  try {
    return await memoized;
  } catch (err) {
    memoized = null;
    memoizedAt = 0;
    throw err;
  }
}

export function resetAppDataVersionMemo() {
  memoized = null;
  memoizedAt = 0;
}
