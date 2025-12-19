"use client";

import { versionResponseSchema, type VersionPayload } from "@/lib/apiSchemas";
import { cachedFetchJson } from "@/lib/clientCache";

export type { VersionPayload };

const VERSION_TTL_MS = 60_000;
const MEMO_WINDOW_MS = 60_000;

let memoized: Promise<VersionPayload> | null = null;
let memoizedAt = 0;

/**
 * Fetches the current app data version from /api/version.
 * Results are memoized briefly in-memory and cached in localStorage
 * to avoid redundant network calls during a session.
 */
export async function getAppDataVersion(): Promise<VersionPayload> {
  const now = Date.now();
  if (memoized && now - memoizedAt < MEMO_WINDOW_MS) {
    return memoized;
  }

  memoizedAt = now;
  memoized = cachedFetchJson<VersionPayload>("/api/version", {
    ttlMs: VERSION_TTL_MS,
    responseSchema: versionResponseSchema,
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
