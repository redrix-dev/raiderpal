# RaiderPal Database Architecture (Authoritative Reference)

## Related docs
- App-side architecture: docs/app-architecture.md
- Data contracts: docs/contracts.md
- Query lexicon: docs/rp-db-query-lexicon.sql
- Schema introspection: docs/rp-schema-introspection-queries.sql
- Schema snapshot: docs/rp-schema-introspection-snapshot.md

This document summarizes the database structure and the constraints the app relies on.

---

## Core design constraints

### Manual truth for missing upstream data
Some game data (notably repair mechanics) is not exposed by upstream sources. Repair profiles and recipes are therefore stored explicitly rather than inferred.

### Layered data pipeline
rp_items_ingest (external payloads)
-> rp_items_patches (manual corrections)
-> rp_items_canonical (authoritative minimal table)
-> read-only views (app consumption contracts)

The app reads only from the view layer and does not query ingest or patch tables directly.

### Canonical table is intentionally minimal
rp_items_canonical stores an id, a JSON payload, and updated_at. This provides a stable foreign key target and keeps schema drift in upstream payloads isolated from app-facing contracts.

---

## View-first app consumption (contracts)

### App-facing views
- rp_view_metadata
- rp_view_crafting_normalized
- rp_view_recycle_outputs
- rp_view_repair_recipes
- rp_view_repair_profiles (current)
- rp_repair_profiles (legacy fallback)
- rp_dataset_version

The app stitches these views in code rather than using a single joined query, which keeps each feature query focused and avoids Cartesian expansion.

### Metadata enrichment
Repository functions attach metadata from rp_view_metadata so UI payloads do not carry ad-hoc name or icon fields.

---

## Repair system architecture

### Why repairs are separate
Repair data is manually curated because upstream sources do not provide it. It is modeled in two normalized tables.

### rp_repair_profiles
One row per repairable item, with max_durability, step_durability, and optional notes.

### rp_repair_recipes
One row per component per repair cycle, with quantity_per_cycle.

### Derived repair math
Repair cycles and total component costs are computed at runtime from profile and recipe data.

---

## App-facing repair view
rp_view_repair_recipes exposes the normalized recipe rows without internal IDs.

---

## Referential integrity
- rp_repair_profiles.item_id references rp_items_canonical.id
- rp_repair_recipes.item_id references rp_repair_profiles.item_id
- rp_repair_recipes.component_id references rp_items_canonical.id

---

## Operational flow (data pipeline)
- External ingest writes to rp_items_ingest (outside this repo).
- Manual corrections live in rp_items_patches.
- rp_items_canonical is refreshed from ingest and patches.
- Read-only views project canonical data into stable app-facing shapes.

---

## Diagnostics and queries
- Query lexicon: docs/rp-db-query-lexicon.sql
- Schema introspection: docs/rp-schema-introspection-queries.sql
- Schema snapshot: docs/rp-schema-introspection-snapshot.md

---

## Invariants reflected in app usage
- Canonical table is authoritative for item IDs.
- App queries only through view contracts.
- Repair data is explicit and normalized.
- Derived values (cycles, totals) are computed at runtime.

## Error handling in app consumption
- In development, query or contract mismatches throw errors.
- In production, API routes return error envelopes instead of silent fallbacks.
