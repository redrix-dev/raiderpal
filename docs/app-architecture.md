# App-Side Architecture: Data Pathways

This document describes the app-side data pathways at a high level. It covers endpoint contracts, data handling, business logic boundaries, and server/client separation.

## Overview
- Server-side data access lives in lib/data/** and is used by API routes and server pages.
- Client components call API routes via useCachedJson and validate response envelopes and data payloads.
- Database access stays on the server to keep Supabase credentials out of the browser and centralize validation.

## Data flow (high level)
Client-initiated flow:
1. A client component calls /api/* via useCachedJson.
2. The API route calls a repository function in lib/data/**.
3. The repository queries a view contract via queryView/queryViewMaybeSingle.
4. Rows are schema-validated and enriched with metadata from rp_view_metadata.
5. The API route validates the payload shape and returns a standard response envelope.
6. The client reads { success, data } or { success, error } and updates UI state.

Server-page flow:
1. A server page calls repository functions directly (no API hop).
2. The same query, validation, and enrichment logic applies.

## Server vs client responsibilities
Server-side:
- Owns database access via lib/data/db/query.ts and lib/supabase.ts.
- Validates rows against view contracts.
- Enriches rows with metadata for UI-ready payloads.
- Converts errors into consistent API envelopes in production.

Client-side:
- Fetches data only via API routes.
- Uses cachedFetchJson/useCachedJson for caching and validation.
- Does not access Supabase directly.

## Core data contracts (view shapes)
Canonical view contracts used by repositories:
- rp_view_metadata: id, name, icon, rarity, item_type, description, value, workbench, loot_area
- rp_view_crafting_normalized: item_id, component_id, total_quantity
- rp_view_recycle_outputs: item_id, component_id, quantity
- rp_view_repair_recipes: item_id, component_id, quantity_per_cycle
- rp_view_repair_profiles: item_id, max_durability, step_durability, notes
- rp_repair_profiles: item_id, max_durability, step_durability, notes (legacy fallback)
- rp_dataset_version: id, version, last_synced_at

## Repository layer (business logic)
- lib/data/items.repo.ts lists canonical items and resolves crafting, recycling, sources, and used-in data with metadata enrichment.
- lib/data/repairs.repo.ts loads repair profiles and recipes, aggregates repairable items, and joins crafting/recycling metadata.
- lib/data/version.repo.ts reads the dataset version, falling back to the first available row if the global row is missing.

## API response envelope
All API routes return a consistent envelope from lib/http.ts:
- Success: { success: true, data: ... }
- Failure: { success: false, error: { code, message } }

## Endpoint breakdown
- /api/items/[id]/crafting: returns crafting components for the item.
- /api/items/[id]/recycling: returns recycling outputs for the item.
- /api/items/[id]/sources: returns best recycling sources for a component.
- /api/items/[id]/used-in: returns items that use a component in crafting.
- /api/repair-economy: returns repairable items with profiles, recipes, crafting, and recycling metadata.
- /api/version: returns dataset version metadata.
- /api/revalidate: revalidates tags or paths (gated by x-revalidate-token).

## Client data handling
- cachedFetchJson validates API envelopes and optionally validates data payloads against schemas.
- useCachedJson wraps cachedFetchJson with React state, loading flags, and refetch support.
- useAppVersion and getAppDataVersion fetch /api/version and provide a version key for cache entries.

## Cache strategy
Page routes:
- app/item-browser/page.tsx and app/repair-calculator/page.tsx are force-dynamic with revalidate = 0.

API routes:
- Item detail endpoints set revalidate = 86400 and send Cache-Control: max-age=900, stale-while-revalidate=85500.
- /api/version and /api/repair-economy set revalidate = 3600 and send Cache-Control: max-age=300, stale-while-revalidate=3300.
- /api/revalidate returns Cache-Control: no-store.

Client cache:
- localStorage keys are versioned with rp_cache_v1:<url>:<version>.
- Default TTL is 1 hour, modal TTL is 15 minutes, and version checks use a 1 minute TTL.
- Long-term caching switches the TTL to Infinity while still versioning keys by dataset version.

## Security layer
- middleware.ts applies security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection).
- itemParamsSchema validates item IDs with length and character checks.
- listCanonicalItems sanitizes search strings with a character whitelist to prevent PostgREST DSL injection.

## Related docs
- Database architecture: docs/raiderpal-db-architecture.md
- Data contracts: docs/contracts.md
- UI ownership: docs/ui-ownership-index.md
- Data layer details: docs/DATA_LAYER.md
