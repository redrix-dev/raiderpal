# REFactor Notes

## Canonical view columns
- rp_view_metadata: id, name, icon, rarity, item_type, description, value, workbench, loot_area
- rp_view_crafting_normalized: item_id, component_id, total_quantity
- rp_view_recycle_outputs: item_id, component_id, quantity
- rp_view_repair_recipes: item_id, component_id, quantity_per_cycle
- rp_repair_profiles: item_id, max_durability, step_durability, notes
- rp_dataset_version: id, version, last_synced_at

## Metadata enrichment (metaById)
- Item metadata is fetched in `lib/data/items.repo.ts` via the metadata view.
- Usage rows keep only ids + quantities; metadata is attached as `component` or `source` via a Map lookup.
- UI code should read metadata from `component` or `source` (no legacy `component_*` fields).

## Adding new component-usage systems
- Add a new contract entry in `lib/data/db/contracts.ts` with relation, select, and schema.
- Use `queryView` or `queryViewMaybeSingle` from `lib/data/db/query.ts` in a repo.
- Add response schemas in `lib/apiSchemas.ts` and validate in the route handler.
- Document the view contract in `docs/contracts.md`.

## Error handling
- `queryView` throws on query or contract violations.
- API routes catch errors and return `{ success: false, error: { code, message } }` in prod.
- In dev, errors are rethrown to make contract drift obvious.
