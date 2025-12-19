# Schema Introspection Snapshot (public)

Purpose:
A human-readable snapshot of the current database shape (tables, keys, views).
Used for ER diagrams, view dependency maps, and onboarding.

---

## Snapshot metadata

- Generated (local date/time):
- Supabase project:
- Schema: public
- Dataset version row (`rp_dataset_version`):
  - id:
  - version:
  - last_synced_at:
- Notes / reason for refresh:

---

## How to interpret this file

- **Tables/Columns**: base table structure (types, nullability, defaults).
- **Primary Keys**: PK columns per table.
- **Foreign Keys**: table.column → referenced_table.column, plus constraint names.
- **Inventory**: list of BASE TABLE vs VIEW objects.
- **View Definitions**: canonical `view_sql` used to build dependency graphs.
- **FK Rules**: CASCADE/RESTRICT behavior for destructive boundaries.

---

## 1) Base tables and columns

| table_name         | column_name               | data_type                | is_nullable | column_default    |
| ------------------ | ------------------------- | ------------------------ | ----------- | ----------------- |
| rp_dataset_version | id                        | text                     | NO          | 'global'::text    |
| rp_dataset_version | version                   | smallint                 | YES         | '1'::smallint     |
| rp_dataset_version | last_synced_at            | timestamp with time zone | YES         | now()             |
| rp_items_canonical | id                        | text                     | NO          | null              |
| rp_items_canonical | payload                   | jsonb                    | NO          | null              |
| rp_items_canonical | updated_at                | timestamp with time zone | NO          | now()             |
| rp_items_ingest    | id                        | text                     | NO          | null              |
| rp_items_ingest    | payload                   | jsonb                    | YES         | null              |
| rp_items_ingest    | updated_at                | timestamp with time zone | YES         | null              |
| rp_items_patches   | id                        | text                     | NO          | null              |
| rp_items_patches   | patch                     | jsonb                    | YES         | null              |
| rp_items_patches   | updated_at                | timestamp with time zone | NO          | now()             |
| rp_patch_ignore    | id                        | text                     | NO          | null              |
| rp_patch_ignore    | ignore_components         | boolean                  | NO          | false             |
| rp_patch_ignore    | ignore_recycle_components | boolean                  | NO          | false             |
| rp_patch_ignore    | notes                     | text                     | YES         | null              |
| rp_patch_ignore    | created_at                | timestamp with time zone | NO          | now()             |
| rp_patch_ignore    | updated_at                | timestamp with time zone | NO          | now()             |
| rp_patch_ignore    | ignore_value              | boolean                  | NO          | false             |
| rp_repair_profiles | item_id                   | text                     | NO          | null              |
| rp_repair_profiles | max_durability            | bigint                   | YES         | null              |
| rp_repair_profiles | step_durability           | smallint                 | NO          | '50'::smallint    |
| rp_repair_profiles | updated_at                | timestamp with time zone | NO          | now()             |
| rp_repair_profiles | notes                     | text                     | YES         | null              |
| rp_repair_recipes  | id                        | uuid                     | NO          | gen_random_uuid() |
| rp_repair_recipes  | component_id              | text                     | YES         | null              |
| rp_repair_recipes  | quantity_per_cycle        | smallint                 | YES         | null              |
| rp_repair_recipes  | item_id                   | text                     | NO          | null              |

---

## 2) Primary keys

| table_name         | column_name |
| ------------------ | ----------- |
| rp_dataset_version | id          |
| rp_items_canonical | id          |
| rp_items_ingest    | id          |
| rp_items_patches   | id          |
| rp_patch_ignore    | id          |
| rp_repair_profiles | item_id     |
| rp_repair_recipes  | id          |

---

## 3) Foreign keys

| table_name         | column_name  | referenced_table   | referenced_column | constraint_name                |
| ------------------ | ------------ | ------------------ | ----------------- | ------------------------------ |
| rp_items_canonical | id           | rp_items_ingest    | id                | rp_items_canonical_id_fkey     |
| rp_items_patches   | id           | rp_items_ingest    | id                | rp-items_patches_id_fkey       |
| rp_patch_ignore    | id           | rp_items_ingest    | id                | rp_patch_ignore_id_fkey        |
| rp_repair_profiles | item_id      | rp_items_canonical | id                | rp_repair_profiles_item_fk     |
| rp_repair_recipes  | component_id | rp_items_canonical | id                | rp_repair_recipes_component_fk |
| rp_repair_recipes  | item_id      | rp_repair_profiles | item_id           | rp_repair_recipes_profile_fk   |

---

## 4) Inventory: tables vs views

> Paste markdown table output here.

| table_name                  | table_type |
| --------------------------- | ---------- |
| rp_dataset_version          | BASE TABLE |
| rp_items_canonical          | BASE TABLE |
| rp_items_ingest             | BASE TABLE |
| rp_items_patches            | BASE TABLE |
| rp_patch_ignore             | BASE TABLE |
| rp_repair_profiles          | BASE TABLE |
| rp_repair_recipes           | BASE TABLE |
| rp_items_needing_any_patch  | VIEW       |
| rp_view_crafting_normalized | VIEW       |
| rp_view_metadata            | VIEW       |
| rp_view_recycle_outputs     | VIEW       |
| rp_view_repair_profiles     | VIEW       |
| rp_view_repair_recipes      | VIEW       |

---

## 5) View definitions (public)

> Paste markdown table output here.
> If the view SQL is huge, it’s OK to keep it as-is in markdown; this is the canonical snapshot.

| schemaname | viewname                    | view_sql                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public     | rp_items_needing_any_patch  |  WITH base AS (
         SELECT i.id,
            i.payload,
            p.patch,
            COALESCE(ig.ignore_components, false) AS ignore_components,
            COALESCE(ig.ignore_recycle_components, false) AS ignore_recycle_components,
            COALESCE(ig.ignore_value, false) AS ignore_value
           FROM rp_items_ingest i
             LEFT JOIN rp_items_patches p ON p.id = i.id
             LEFT JOIN rp_patch_ignore ig ON ig.id = i.id
        ), flags AS (
         SELECT base.id,
            base.payload ->> 'name'::text AS name,
            base.payload ->> 'item_type'::text AS item_type,
            base.payload ->> 'rarity'::text AS rarity,
            base.payload ->> 'workbench'::text AS workbench,
            COALESCE(jsonb_typeof(base.patch -> 'components'::text) = 'array'::text AND jsonb_array_length(base.patch -> 'components'::text) > 0, false) AS has_components_patch,
            COALESCE(jsonb_typeof(base.patch -> 'recycle_components'::text) = 'array'::text AND jsonb_array_length(base.patch -> 'recycle_components'::text) > 0, false) AS has_recycle_patch,
            base.patch ? 'value'::text AS has_value_patch,
            base.ignore_components,
            base.ignore_recycle_components,
            base.ignore_value,
            NULLIF(base.payload ->> 'workbench'::text, ''::text) IS NOT NULL AND ((base.payload -> 'components'::text) IS NULL OR jsonb_typeof(base.payload -> 'components'::text) <> 'array'::text OR jsonb_array_length(base.payload -> 'components'::text) = 0) AS missing_components_raw,
            (base.payload -> 'recycle_components'::text) IS NULL OR jsonb_typeof(base.payload -> 'recycle_components'::text) <> 'array'::text OR jsonb_array_length(base.payload -> 'recycle_components'::text) = 0 AS missing_recycle_raw,
            COALESCE(NULLIF(base.payload ->> 'value'::text, ''::text)::integer, 0) = 0 AS missing_value_raw
           FROM base
        )
 SELECT id,
    name,
    item_type,
    rarity,
    workbench,
    missing_components_raw AND NOT has_components_patch AND NOT ignore_components AS needs_components_patch,
    missing_recycle_raw AND NOT has_recycle_patch AND NOT ignore_recycle_components AS needs_recycle_patch,
    missing_value_raw AND NOT has_value_patch AND NOT ignore_value AS needs_value_patch,
    has_components_patch,
    has_recycle_patch,
    has_value_patch,
    ignore_components,
    ignore_recycle_components,
    ignore_value
   FROM flags
  WHERE missing_components_raw AND NOT has_components_patch AND NOT ignore_components OR missing_recycle_raw AND NOT has_recycle_patch AND NOT ignore_recycle_components OR missing_value_raw AND NOT has_value_patch AND NOT ignore_value
  ORDER BY ((missing_components_raw AND NOT has_components_patch AND NOT ignore_components)::integer + (missing_recycle_raw AND NOT has_recycle_patch AND NOT ignore_recycle_components)::integer + (missing_value_raw AND NOT has_value_patch AND NOT ignore_value)::integer) DESC, name, id; |
| public     | rp_view_crafting_normalized |  WITH RECURSIVE craft_tree AS (
         SELECT i.id AS root_item_id,
            i.id AS current_item_id,
            COALESCE(c.value ->> 'component_item_id'::text, (c.value -> 'component'::text) ->> 'id'::text) AS component_id,
            (c.value ->> 'quantity'::text)::integer AS quantity,
            regexp_replace(i.id, '-(i|ii|iii|iv)$'::text, ''::text) AS root_family,
            regexp_replace(COALESCE(c.value ->> 'component_item_id'::text, (c.value -> 'component'::text) ->> 'id'::text), '-(i|ii|iii|iv)$'::text, ''::text) AS component_family,
            COALESCE(c.value ->> 'component_item_id'::text, (c.value -> 'component'::text) ->> 'id'::text) ~ '-(i|ii|iii|iv)$'::text AS is_tiered_component
           FROM rp_items_canonical i
             JOIN LATERAL jsonb_array_elements(i.payload -> 'components'::text) c(value) ON jsonb_typeof(i.payload -> 'components'::text) = 'array'::text
          WHERE i.id !~ '-recipe$'::text AND COALESCE(c.value ->> 'component_item_id'::text, (c.value -> 'component'::text) ->> 'id'::text) !~ '-recipe$'::text
        UNION ALL
         SELECT ct.root_item_id,
            ci.id AS current_item_id,
            COALESCE(c.value ->> 'component_item_id'::text, (c.value -> 'component'::text) ->> 'id'::text) AS component_id,
            ct.quantity * ((c.value ->> 'quantity'::text)::integer) AS quantity,
            ct.root_family,
            regexp_replace(COALESCE(c.value ->> 'component_item_id'::text, (c.value -> 'component'::text) ->> 'id'::text), '-(i|ii|iii|iv)$'::text, ''::text) AS component_family,
            COALESCE(c.value ->> 'component_item_id'::text, (c.value -> 'component'::text) ->> 'id'::text) ~ '-(i|ii|iii|iv)$'::text AS is_tiered_component
           FROM craft_tree ct
             JOIN rp_items_canonical ci ON ci.id = ct.component_id
             JOIN LATERAL jsonb_array_elements(ci.payload -> 'components'::text) c(value) ON jsonb_typeof(ci.payload -> 'components'::text) = 'array'::text
          WHERE ct.is_tiered_component = true AND ct.component_family = ct.root_family AND ci.id !~ '-recipe$'::text AND COALESCE(c.value ->> 'component_item_id'::text, (c.value -> 'component'::text) ->> 'id'::text) !~ '-recipe$'::text
        )
 SELECT root_item_id AS item_id,
    component_id,
    sum(quantity) AS total_quantity
   FROM craft_tree
  WHERE NOT (is_tiered_component AND component_family = root_family)
  GROUP BY root_item_id, component_id;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public     | rp_view_metadata            |  SELECT id,
    payload ->> 'name'::text AS name,
    payload ->> 'icon'::text AS icon,
    payload ->> 'rarity'::text AS rarity,
    payload ->> 'item_type'::text AS item_type,
    payload ->> 'subcategory'::text AS subcategory,
    NULLIF(payload ->> 'value'::text, ''::text)::integer AS value,
    NULLIF(payload ->> 'ammo_type'::text, ''::text) AS ammo_type,
    NULLIF(payload ->> 'workbench'::text, ''::text) AS workbench,
    payload ->> 'description'::text AS description,
    payload ->> 'flavor_text'::text AS flavor_text,
    NULLIF(payload ->> 'loot_area'::text, ''::text) AS loot_area,
    NULLIF(payload ->> 'shield_type'::text, ''::text) AS shield_type,
    payload -> 'loadout_slots'::text AS loadout_slots,
    payload -> 'locations'::text AS locations,
    (payload ->> 'updated_at'::text)::timestamp with time zone AS source_updated_at,
    updated_at AS canonical_updated_at,
    id ~ '-recipe$'::text AS is_recipe,
    id ~ '-(i|ii|iii|iv)$'::text AS is_tiered,
    regexp_replace(id, '-(i|ii|iii|iv)$'::text, ''::text) AS tier_family
   FROM rp_items_canonical c;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| public     | rp_view_recycle_outputs     |  SELECT i.id AS item_id,
    i.payload ->> 'name'::text AS item_name,
    COALESCE(rc.value ->> 'component_item_id'::text, (rc.value -> 'component'::text) ->> 'id'::text) AS component_id,
    NULLIF(rc.value ->> 'quantity'::text, ''::text)::integer AS quantity,
    c.payload ->> 'name'::text AS component_name,
    c.payload ->> 'icon'::text AS component_icon,
    c.payload ->> 'rarity'::text AS component_rarity,
    c.payload ->> 'item_type'::text AS component_item_type
   FROM rp_items_canonical i
     JOIN LATERAL jsonb_array_elements(i.payload -> 'recycle_components'::text) rc(value) ON jsonb_typeof(i.payload -> 'recycle_components'::text) = 'array'::text
     LEFT JOIN rp_items_canonical c ON c.id = COALESCE(rc.value ->> 'component_item_id'::text, (rc.value -> 'component'::text) ->> 'id'::text)
  WHERE jsonb_typeof(i.payload -> 'recycle_components'::text) = 'array'::text AND jsonb_array_length(i.payload -> 'recycle_components'::text) > 0;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| public     | rp_view_repair_profiles     |  SELECT item_id,
    max_durability,
    step_durability,
    notes
   FROM rp_repair_profiles;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| public     | rp_view_repair_recipes      |  SELECT item_id,
    component_id,
    quantity_per_cycle
   FROM rp_repair_recipes;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

---

## 6) FK update/delete rules

| table_name         | constraint_name                | update_rule | delete_rule |
| ------------------ | ------------------------------ | ----------- | ----------- |
| rp_items_canonical | rp_items_canonical_id_fkey     | CASCADE     | CASCADE     |
| rp_items_patches   | rp-items_patches_id_fkey       | CASCADE     | CASCADE     |
| rp_patch_ignore    | rp_patch_ignore_id_fkey        | CASCADE     | CASCADE     |
| rp_repair_profiles | rp_repair_profiles_item_fk     | CASCADE     | RESTRICT    |
| rp_repair_recipes  | rp_repair_recipes_component_fk | CASCADE     | RESTRICT    |
| rp_repair_recipes  | rp_repair_recipes_profile_fk   | CASCADE     | CASCADE     |
