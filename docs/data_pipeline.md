# Data Pipeline Notes (local only)

## Tables
- items
- item_economy_full
- crafting_recipes
- recycling_sources
- item_repair_costs / item_repair_profiles / item_upgrade_costs
- staging/ingest helpers: item_repair_costs_stage, item_upgrade_costs_stage, staging_item_repair_cost, items_mega_pull_full (used during ingestion only)

## Views consumed by the app
- view_item_economy: flattened economy JSON for items (used by data/repairEconomy.ts)
- view_repairable_items: repair/craft/recycle costs for the calculator (data/repairEconomy.ts)
- view_crafting_recipes: crafting inputs per item (data/crafting.ts)
- view_recycling_sources: recycling inputs/outputs (data/recycling.ts, data/yields.ts)
- view_used_in (a.k.a. view_used_in_recipes): where an item is used as a component (data/usedIn.ts)

## Flow
Raw tables ? staging tables (during ingestion) ? normalized tables ? views above ? data/* queries ? UI components.

## Notes
- Versioning comes from app_metadata.version and is passed to client fetches as dataVersion.
- Hot lookups often filter on item_id/component_id/source_item_id; indexes recommended there.
- If schema/view shapes change, update the TS row types in data/* to match.
