# Data Layer

## Validation primitives
- lib/validation.ts defines a lightweight schema system with Schema, safeParse, parse, nullable, and a z helper for string, number, literal, array, object, and union schemas.
- Object validation errors include the failing field name (for example, Invalid field 'key': ...).

## DB contracts and types
- View contracts live in lib/data/db/contracts.ts and map a relation name, select list, and schema for each view.
- Contracts include metadata, crafting, recycling, repairRecipes, repairProfiles, legacyRepairProfiles, and datasetVersion.
- DB-facing TypeScript shapes live in lib/data/db/types.ts (CanonicalItem, RepairableItem, CraftingComponentRow, RecyclingOutputRow, UsedInRow, and related types).

### Contract map
- metadata: rp_view_metadata (id, name, description, item_type, rarity, icon, value, workbench, loot_area)
- crafting: rp_view_crafting_normalized (item_id, component_id, total_quantity)
- recycling: rp_view_recycle_outputs (item_id, component_id, quantity)
- repairRecipes: rp_view_repair_recipes (item_id, component_id, quantity_per_cycle)
- repairProfiles: rp_view_repair_profiles (item_id, max_durability, step_durability, notes)
- legacyRepairProfiles: rp_repair_profiles (item_id, max_durability, step_durability, notes)
- datasetVersion: rp_dataset_version (id, version, last_synced_at)

## Query helpers (DB boundary)
- queryView and queryViewMaybeSingle in lib/data/db/query.ts execute Supabase queries using a view contract and validate rows with schema.safeParse.
- Validation failures throw DataQueryError with db_contract or db_error codes.
- Supabase clients are created in lib/supabase.ts using anon or service credentials.

## Repositories (server data access)
- lib/data/items.repo.ts: canonical item listing plus crafting, recycling, sources, and used-in relationships with metadata enrichment.
- lib/data/repairs.repo.ts: repair profiles, recipes, and aggregated repairable items that include crafting and recycling metadata.
- lib/data/version.repo.ts: dataset version lookup with a fallback to the first available row when the global row is missing.
- lib/data/index.ts re-exports repository functions and types for server use.
- lib/data/client.ts re-exports types and repair math for client use.

## Domain calculations
- Repair math helpers (computeRepairCycles, computeRepairCost, computeRepairSummary) live in lib/data/repairs.math.ts.

## API schemas and response envelopes
- lib/apiSchemas.ts defines request/response schemas for API routes.
- lib/http.ts defines the ApiResponse envelope and helpers (jsonOk, jsonError, jsonErrorFromException, assertResponseShape).

## Client cache and fetch
- lib/clientCache.ts implements localStorage caching with TTL, versioned keys, and eviction when storage is full.
- hooks/useCachedJson.ts wraps cached fetches into a React hook with loading and error state.
- lib/appVersionClient.ts and hooks/useAppVersion.ts fetch and memoize /api/version for cache versioning.
