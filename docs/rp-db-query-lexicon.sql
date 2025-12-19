-- RaiderPal SQL Query Lexicon
-- This file is the ONLY place queries should be copied from.
-- Supabase SQL editor is execution-only; this file is the source of truth.
-- Schema introspection queries now live in docs/rp-schema-introspection-queries.sql.

--------------------------------------------------
-- Q_INGEST_COUNTS
-- Quick health check: ingest + canonical row counts
--------------------------------------------------
select
  (select count(*) from public.rp_items_ingest) as ingest_rows,
  (select count(*) from public.rp_items_canonical) as canonical_rows;

--------------------------------------------------
-- Q_INGEST_CHANGED_SINCE
-- Delta list: items changed/new since a given timestamp
--------------------------------------------------
select id
from public.rp_items_ingest
where updated_at >= '<timestamptz>'::timestamptz
order by id;

--------------------------------------------------
-- Q_INGEST_UPSERT_RPC_CREATE
-- Creates a batch upsert RPC that only updates when payload changes.
-- Use this with the Edge Function to avoid firing canonical refresh triggers
-- for unchanged payloads.
--------------------------------------------------
create or replace function public.rp_items_ingest_upsert_batch(_rows jsonb)
returns int
language plpgsql
security definer
as $$
declare
  v_count int := 0;
begin
  with incoming as (
    select
      (x->>'id')::text as id,
      (x->'payload')::jsonb as payload,
      coalesce((x->>'updated_at')::timestamptz, now()) as updated_at
    from jsonb_array_elements(_rows) as x
  ),
  upserted as (
    insert into public.rp_items_ingest (id, payload, updated_at)
    select id, payload, updated_at
    from incoming
    on conflict (id) do update
      set payload = excluded.payload,
          updated_at = excluded.updated_at
      where public.rp_items_ingest.payload is distinct from excluded.payload
    returning 1
  )
  select count(*) into v_count from upserted;

  return v_count;
end;
$$;

--------------------------------------------------
-- Q_CANONICAL_SINGLE_ITEM
-- Fetch one canonical item by id (raw payload)
--------------------------------------------------
select id, payload, updated_at
from public.rp_items_canonical
where id = '<item-id>';

--------------------------------------------------
-- Q_VIEW_REPAIR_RECIPES_CREATE
-- App-facing contract view for repair recipes (drops internal row id)
--------------------------------------------------
create or replace view public.rp_view_repair_recipes as
select
  item_id,
  component_id,
  quantity_per_cycle
from public.rp_repair_recipes;

--------------------------------------------------
-- Q_REPAIR_PROFILES_MISSING_RECIPES
-- Worklist of repairable items lacking recipes
-- Note: canonical is minimal (id/payload/updated_at), so we extract display fields from payload.
--------------------------------------------------
select
  p.item_id,
  (i.payload->>'name') as name,
  (i.payload->>'item_type') as item_type,
  (i.payload->>'rarity') as rarity
from public.rp_repair_profiles p
join public.rp_items_canonical i on i.id = p.item_id
left join public.rp_repair_recipes r on r.item_id = p.item_id
where r.id is null
order by item_type, rarity, name;

--------------------------------------------------
-- Q_REPAIR_SANITY_BAD_ROWS
-- Detect invalid quantities or missing components
--------------------------------------------------
select
  sum((component_id is null or component_id = '')::int) as bad_component_ids,
  sum((quantity_per_cycle is null or quantity_per_cycle <= 0)::int) as bad_qty
from public.rp_repair_recipes;

--------------------------------------------------
-- Q_REPAIR_ADD_ITEM
-- Canonical pattern for adding a new repairable item
--------------------------------------------------
-- 1) Add / update profile
insert into public.rp_repair_profiles (item_id, max_durability, step_durability)
values ('<item-id>', 100, 50)
on conflict (item_id) do update
set max_durability = excluded.max_durability,
    step_durability = excluded.step_durability;

-- 2) Add recipe rows
-- If `rp_repair_recipes.id` has a DEFAULT (uuid) you should omit it on insert.
insert into public.rp_repair_recipes (item_id, component_id, quantity_per_cycle)
values
  ('<item-id>', '<component-id>', 2);

--------------------------------------------------
-- Q_REPAIR_REPLACE_RECIPE
-- Deletes and re-adds a recipe cleanly
--------------------------------------------------
delete from public.rp_repair_recipes
where item_id = '<item-id>';
-- reinsert new rows after delete

--------------------------------------------------
-- Q_REPAIR_ITEM_COMPONENTS
-- Inspect recipe for a single item (raw table)
--------------------------------------------------
select
  r.item_id,
  r.component_id,
  r.quantity_per_cycle
from public.rp_repair_recipes r
where r.item_id = '<item-id>'
order by r.component_id;

--------------------------------------------------
-- Q_REPAIR_ITEMS_USING_COMPONENT
-- Reverse lookup: where a component is used (includes item name from payload)
--------------------------------------------------
select
  r.item_id,
  (i.payload->>'name') as name,
  r.quantity_per_cycle
from public.rp_repair_recipes r
join public.rp_items_canonical i on i.id = r.item_id
where r.component_id = '<component-id>'
order by name;

--------------------------------------------------
-- Q_CANONICAL_MISSING_PATCHES
-- Items that have patch rows (diagnostic)
--------------------------------------------------
select *
from public.rp_items_patches
where ignore = false;
