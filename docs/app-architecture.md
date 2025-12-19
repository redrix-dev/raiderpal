# App-Side Architecture: Data Pathways

This document describes the app-side data pathways at a high level with concrete examples. It covers endpoint contracts, data handling, business logic, and server/client separation, with reasoning and best practices.

## Overview
The app uses a clear split between server-side data access and client-side consumption:
- Server-side: Supabase queries live in `lib/data/**` and are used by API routes and server components.
- Client-side: Client components fetch data from API routes using a cache wrapper, and validate response envelopes (and data payloads when schemas are provided).

This separation keeps database access on the server (security, RLS, and stability) while exposing a stable, validated API for client code.

## Data Flow (High-Level)
Client-initiated flow:
1. Client component calls `/api/*` via `useCachedJson`.
2. API route calls repository function in `lib/data/**`.
3. Repository uses `queryView` to query Supabase with centralized relation names and select lists.
4. Results are schema-validated and enriched with metadata (via `metaById` maps).
5. API route validates output shape and returns a consistent response envelope.
6. Client receives `{ success, data }` or `{ success, error: { code, message } }` and updates UI.

Server-component flow:
1. Server component calls repository functions directly (no API hop).
2. Repository uses the same `queryView` contract and metadata enrichment.
3. Server component renders using the returned data.

Reasoning:
- Centralized relation names reduce string drift after view refactors.
- Schema validation catches DB/view contract drift early.
- Consistent API envelopes simplify error handling and caching.

## Server vs Client Responsibilities
### Server-side
- Owns database access (`lib/data/db/query.ts`).
- Validates incoming data from Supabase views/tables.
- Enriches rows with metadata from `rp_view_metadata`.
- Throws loud errors in dev; in prod, API routes return error envelopes for contract/query failures (no empty array fallbacks).

Why:
- Protects the client from DB schema details.
- Keeps business logic server-side to prevent duplication.
- Improves observability when contracts break.

### Client-side
- Calls API routes only.
- Uses cached fetching (`useCachedJson`) and response envelope validation; data payload validation is optional and driven by the caller.
- Never reaches directly into Supabase.

Why:
- Avoids exposing Supabase keys or bypassing RLS.
- Makes client code resilient and easier to change.
- Keeps UI logic focused on rendering and interaction.

## Core Data Contracts (View Shapes)
Canonical view contracts used by repositories:
- `rp_view_metadata`: `{ id, name, icon, rarity, item_type, description, value, workbench, loot_area }`
- `rp_view_crafting_normalized`: `{ item_id, component_id, total_quantity }`
- `rp_view_recycle_outputs`: `{ item_id, component_id, quantity }`
- `rp_view_repair_recipes`: `{ item_id, component_id, quantity_per_cycle }`
- `rp_repair_profiles`: `{ item_id, max_durability, step_durability, notes }`
- `rp_dataset_version`: `{ id, version, last_synced_at }`

Best practice:
- Treat these contracts as immutable API boundaries.
- Validate at fetch time and fail loudly in dev to catch drift immediately.

## Repository Layer (Business Logic)
Repositories convert raw rows into domain-ready objects and apply business logic.

### Metadata enrichment
Used across crafting/recycling/repairs to keep UI payloads consistent.

Example: crafting rows
```
input (view):  { item_id, component_id, total_quantity }
metaById:      { [component_id]: { id, name, rarity, icon, item_type, ... } }
output:        { item_id, component_id, quantity, component }
```

Why:
- Eliminates legacy `component_name` fallback fields.
- Ensures metadata is always sourced from `rp_view_metadata`.
- Minimizes UI logic and avoids data inconsistencies.

### Shared query helper
`queryView` wraps Supabase queries with:
- Centralized relation names and select lists.
- Strict schema parsing for each row.
- Environment-aware error handling (throw in dev, surface error envelopes in prod).

Why:
- Consistent error semantics.
- Fewer ad-hoc casts and missing-view fallbacks.
- Lower maintenance and safer refactors.

## API Response Envelope
Every API route returns:
- Success: `{ success: true, data: ... }`
- Failure: `{ success: false, error: { code, message } }`

Why:
- Predictable client handling.
- Easier to cache and validate.
- Standardized error reporting.
- Schema validation errors are converted to strings before throwing so API responses always carry a string message.

## Endpoint Breakdown
Below are the core endpoints, their purpose, and expected responses.

### `/api/items/[id]/crafting`
Returns the crafting components for a given item.
- Source: `rp_view_crafting_normalized`
- Quantity field: `total_quantity`
- Output shape:
```
{ success: true, data: [
  { item_id, component_id, quantity, component }
]}
```

### `/api/items/[id]/recycling`
Returns what an item recycles into.
- Source: `rp_view_recycle_outputs`
- Quantity field: `quantity`
- Output shape:
```
{ success: true, data: [
  { item_id, component_id, quantity, component }
]}
```

### `/api/items/[id]/sources`
Returns the best sources for a component (reverse lookup of recycling).
- Source: `rp_view_recycle_outputs`
- Output shape:
```
{ success: true, data: [
  { source_item_id, component_id, quantity, source }
]}
```

### `/api/items/[id]/used-in`
Returns items that use a given component in crafting.
- Source: `rp_view_crafting_normalized`
- Output shape:
```
{ success: true, data: [
  { product_item_id, quantity, product }
]}
```

### `/api/repair-economy`
Returns all repairable items and their recipes.
- Sources: `rp_repair_profiles`, `rp_view_repair_recipes`
- Output shape:
```
{ success: true, data: [
  { item, profile, recipe }
]}
```

### `/api/version`
Returns dataset version metadata.
- Source: `rp_dataset_version`
- Output shape:
```
{ success: true, data: { version, last_synced_at } }
```

### `/api/revalidate`
Revalidates cache tags or paths for ISR.
- Requires `x-revalidate-token` header.
- Input: `{ tags?: string[], paths?: string[] }`
- Output shape:
```
{ success: true, data: { revalidated: { tags, paths } } }
```

## Client Data Handling
The client uses `useCachedJson` + `cachedFetchJson`:
- Reads and validates the response envelope.
- On success, optionally validates the `data` payload against a schema when one is provided by the caller.
- On failure, raises a normalized error message for UI display.

Why:
- Avoids silent failures.
- Guarantees UI receives valid shapes.
- Simplifies caching logic.

## Cache Strategy

### ISR (Incremental Static Regeneration)
- Item detail pages: `revalidate = 86400` (24 hours)
- Browse pages: `force-dynamic` (always fresh for search/filter)
- Tool pages: `force-dynamic` (interactive calculators)

### API Route Caching
```typescript
// Fast-changing data (version checks, repair economy)
"Cache-Control": "public, max-age=300, stale-while-revalidate=3300"

// Stable data (item details, crafting, recycling)
"Cache-Control": "public, max-age=900, stale-while-revalidate=85500"
```

### Client-Side Cache
- Uses `localStorage` with version-aware keys
- Default TTL: 1 hour (configurable to 30 days)
- Auto-invalidates when `dataVersion` changes

## Best-Practice Notes
- Centralize relation names and select lists to avoid string drift.
- Enforce view contracts with schema validation.
- Keep DB access on the server; expose only API routes to the client.
- Use a predictable response envelope for all API routes.
- Keep repository functions small and composable.

## Example End-to-End Pathway
Example: user views an item detail page.
1. Client selects item.
2. UI calls `/api/items/[id]/crafting`.
3. API route calls `getCraftingForItem`.
4. Repository queries `rp_view_crafting_normalized` via `queryView`.
5. Metadata is attached using `metaById`.
6. API validates output and returns `{ success: true, data }`.
7. Client validates response and renders.

## Security Layer

### Middleware
- **Security headers**: `middleware.ts` applies defense-in-depth headers to all responses
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Content-Security-Policy with restrictive defaults

### Input Validation
- **Search sanitization**: `lib/data/items.repo.ts` validates search inputs with character whitelist (`/^[\w\s\-'.]*$/`) to prevent PostgREST DSL injection
- **ID validation**: `lib/apiSchemas.ts` restricts ID parameters to 255 characters max and alphanumeric/underscore/hyphen characters via enhanced validation library
- **Schema validation**: All API inputs and outputs validated against schemas

## Evidence (File References)
- Centralized relation names: `lib/data/db/contracts.ts`
- Query + validation behavior: `lib/data/db/query.ts`
- Error envelope helper: `lib/http.ts`
- View contracts + response schemas: `lib/apiSchemas.ts`
- Response envelope shape: `lib/http.ts`
- Example API route: `app/api/items/[id]/crafting/route.ts`
- Server component direct repository usage: `app/items/[id]/page.tsx`
- Client cached fetch usage: `hooks/useCachedJson.ts`
- Client schema-validated usage: `components/ItemsBrowseClient.tsx`
- Security middleware: `middleware.ts`
- Input validation: `lib/data/items.repo.ts`, `lib/apiSchemas.ts`, `lib/validation.ts`
- Cache eviction: `lib/clientCache.ts`

This flow isolates responsibilities, reduces data drift risk, and improves clarity for future refactors.

## Related Docs
- Database architecture (authoritative): docs/raiderpal-db-architecture.md
- Refactor notes: REFactorNotes.md
- Data contracts: docs/contracts.md
