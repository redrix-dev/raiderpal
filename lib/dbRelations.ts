// lib/dbRelations.ts
export const DB = {
  items: "rp_view_items",
  crafting: "rp_view_crafting_recipes",
  recycling: "rp_view_recycling_sources",
  recyclingFull: "rp_view_recycling_sources_full",
  usedIn: "rp_view_used_in",
  repairEconomy: "rp_view_repairable_items",

  // This is the version row used for cache-busting.
  dataVersion: "rp_app_metadata",
} as const;
