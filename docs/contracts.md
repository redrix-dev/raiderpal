# Data Contracts (Views and Columns)

This document lists the app-facing view contracts and their expected columns. These are the shapes the app code assumes when querying Supabase.

## View contracts
- rp_view_metadata: id, name, description, item_type, rarity, icon, value, workbench, loot_area
- rp_view_crafting_normalized: item_id, component_id, total_quantity
- rp_view_recycle_outputs: item_id, component_id, quantity
- rp_view_repair_recipes: item_id, component_id, quantity_per_cycle
- rp_view_repair_profiles: item_id, max_durability, step_durability, notes
- rp_repair_profiles: item_id, max_durability, step_durability, notes (legacy fallback)
- rp_dataset_version: id, version, last_synced_at

## Helpers used across the app
- VIEW_CONTRACTS in lib/data/db/contracts.ts
- queryView and queryViewMaybeSingle in lib/data/db/query.ts
- jsonErrorFromException in lib/http.ts
- useCachedJson in hooks/useCachedJson.ts

## Example usage
```ts
const rows = await queryView(VIEW_CONTRACTS.crafting, (q) =>
  q.eq("item_id", itemId).order("component_id", { ascending: true })
);
```
