export const CACHE = {
  DEFAULT_TTL_MS: 60 * 60 * 1000, // 1 hour
  LONG_TTL_MS: 30 * 24 * 60 * 60 * 1000, // 30 days
  VERSION_TTL_MS: 60 * 1000, // 1 minute
} as const;

export const QUERY = {
  DEFAULT_SEARCH_LIMIT: 50,
  MAX_ITEMS_PER_PAGE: 100,
} as const;

export const REVALIDATE = {
  HOURLY: 3600,
  DAILY: 86400,
  NEVER: 0,
} as const;
