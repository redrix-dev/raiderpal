import { createSupabaseServerClient } from "./db/server";
import type {
  CanonicalItem,
  CanonicalItemSummary,
  CraftingComponentRow,
  RecyclingOutputRow,
  UsedInRow,
} from "./db/types";

const METADATA_VIEW = "rp_view_metadata";
const CRAFTING_VIEW = "rp_view_crafting_normalized";
const RECYCLING_VIEW = "rp_view_recycling_outputs";

function mapMetadata(row: Record<string, any>): CanonicalItemSummary {
  return {
    id: String(row.id),
    name: row.name ?? row.id ?? null,
    description: row.description ?? null,
    item_type: row.item_type ?? null,
    rarity: row.rarity ?? null,
    icon: row.icon ?? null,
    value: typeof row.value === "number" ? row.value : row.value ?? null,
    workbench: row.workbench ?? null,
    loot_area: row.loot_area ?? null,
  };
}

export async function getCanonicalItemById(
  id: string
): Promise<CanonicalItem | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(METADATA_VIEW)
    .select(
      "id, name, description, item_type, rarity, icon, value, workbench, loot_area"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getCanonicalItemById failed for ${id}: ${error.message}`);
  }

  return data ? (mapMetadata(data) as CanonicalItem) : null;
}

export type ListItemFilters = {
  search?: string;
  rarity?: string;
  itemType?: string;
  limit?: number;
  offset?: number;
};

export async function listCanonicalItems(
  filters: ListItemFilters = {}
): Promise<CanonicalItemSummary[]> {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from(METADATA_VIEW)
    .select("id, name, item_type, rarity, icon, value, workbench, loot_area")
    .order("name", { ascending: true });

  if (filters.search) {
    const q = `%${filters.search.trim()}%`;
    query = query.or(
      `name.ilike.${q},item_type.ilike.${q},loot_area.ilike.${q}`
    );
  }

  if (filters.rarity) {
    query = query.eq("rarity", filters.rarity);
  }

  if (filters.itemType) {
    query = query.eq("item_type", filters.itemType);
  }

  if (typeof filters.limit === "number") {
    const from = filters.offset ?? 0;
    query = query.range(from, from + filters.limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`listCanonicalItems failed: ${error.message}`);
  }

  return (data ?? []).map(mapMetadata);
}

export async function searchCanonicalItems(
  query: string
): Promise<CanonicalItemSummary[]> {
  return listCanonicalItems({ search: query, limit: 50 });
}

export async function getItemsByIds(
  ids: string[]
): Promise<CanonicalItemSummary[]> {
  if (!ids.length) return [];

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(METADATA_VIEW)
    .select("id, name, item_type, rarity, icon, value, workbench, loot_area")
    .in("id", ids);

  if (error) {
    throw new Error(`getItemsByIds failed: ${error.message}`);
  }

  return (data ?? []).map(mapMetadata);
}

export async function getCraftingForItem(
  itemId: string
): Promise<CraftingComponentRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(CRAFTING_VIEW)
    .select("item_id, component_item_id, quantity")
    .eq("item_id", itemId)
    .order("component_item_id", { ascending: true });

  if (error) {
    throw new Error(`getCraftingForItem failed for ${itemId}: ${error.message}`);
  }

  const componentIds = Array.from(
    new Set((data ?? []).map((row) => row.component_item_id).filter(Boolean))
  );
  const components = await getItemsByIds(componentIds);
  const metaById = new Map(components.map((c) => [c.id, c]));

  return (data ?? []).map((row) => {
    const component = metaById.get(row.component_item_id ?? "");
    return {
      item_id: row.item_id,
      component_item_id: row.component_item_id,
      quantity: Number(row.quantity ?? 0),
      component,
      component_name:
        component?.name ??
        (row as { component_name?: string | null })?.component_name ??
        null,
      component_icon: component?.icon ?? null,
      component_rarity:
        component?.rarity ??
        (row as { component_rarity?: string | null })?.component_rarity ??
        null,
      component_type:
        (row as { component_type?: string | null })?.component_type ??
        component?.item_type ??
        null,
    };
  });
}

export async function getRecyclingForItem(
  itemId: string
): Promise<RecyclingOutputRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(RECYCLING_VIEW)
    .select("source_item_id, component_item_id, quantity")
    .eq("source_item_id", itemId)
    .order("component_item_id", { ascending: true });

  if (error) {
    throw new Error(`getRecyclingForItem failed for ${itemId}: ${error.message}`);
  }

  const componentIds = Array.from(
    new Set((data ?? []).map((row) => row.component_item_id).filter(Boolean))
  );
  const components = await getItemsByIds(componentIds);
  const metaById = new Map(components.map((c) => [c.id, c]));

  return (data ?? []).map((row) => {
    const component = metaById.get(row.component_item_id ?? "");
    return {
      source_item_id: row.source_item_id,
      component_item_id: row.component_item_id,
      component_id: row.component_item_id,
      quantity: Number(row.quantity ?? 0),
      component,
      component_name:
        component?.name ??
        (row as { component_name?: string | null })?.component_name ??
        null,
      component_icon: component?.icon ?? null,
      component_rarity:
        component?.rarity ??
        (row as { component_rarity?: string | null })?.component_rarity ??
        null,
      component_type:
        (row as { component_type?: string | null })?.component_type ??
        component?.item_type ??
        null,
    };
  });
}

export async function getRecyclingIdSets(): Promise<{
  needableIds: string[];
  haveableIds: string[];
}> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(RECYCLING_VIEW)
    .select("source_item_id, component_item_id");

  if (error) {
    throw new Error(`getRecyclingIdSets failed: ${error.message}`);
  }

  const needableIds = new Set<string>();
  const haveableIds = new Set<string>();

  for (const row of data ?? []) {
    const sourceId = row.source_item_id as string | null;
    const componentId = row.component_item_id as string | null;
    if (componentId) needableIds.add(componentId);
    if (sourceId) haveableIds.add(sourceId);
  }

  return {
    needableIds: Array.from(needableIds),
    haveableIds: Array.from(haveableIds),
  };
}

export async function getBestSourcesForItem(
  componentId: string
): Promise<RecyclingOutputRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(RECYCLING_VIEW)
    .select("source_item_id, component_item_id, quantity")
    .eq("component_item_id", componentId)
    .order("quantity", { ascending: false });

  if (error) {
    throw new Error(
      `getBestSourcesForItem failed for ${componentId}: ${error.message}`
    );
  }

  const sourceIds = Array.from(
    new Set((data ?? []).map((row) => row.source_item_id).filter(Boolean))
  );
  const sources = await getItemsByIds(sourceIds);
  const metaById = new Map(sources.map((c) => [c.id, c]));

  return (data ?? []).map((row) => ({
    source_item_id: row.source_item_id,
    component_item_id: row.component_item_id,
    component_id: row.component_item_id,
    quantity: Number(row.quantity ?? 0),
    component: metaById.get(row.source_item_id ?? ""),
    component_name:
      metaById.get(row.source_item_id ?? "")?.name ??
      (row as { source_name?: string | null })?.source_name ??
      null,
    component_icon: metaById.get(row.source_item_id ?? "")?.icon ?? null,
    component_rarity: metaById.get(row.source_item_id ?? "")?.rarity ?? null,
    component_type:
      (row as { component_type?: string | null })?.component_type ??
      metaById.get(row.source_item_id ?? "")?.item_type ??
      null,
  }));
}

export async function getUsedInForItem(itemId: string): Promise<UsedInRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(CRAFTING_VIEW)
    .select("item_id, component_item_id, quantity")
    .eq("component_item_id", itemId)
    .order("item_id", { ascending: true });

  if (error) {
    throw new Error(`getUsedInForItem failed for ${itemId}: ${error.message}`);
  }

  const productIds = Array.from(
    new Set((data ?? []).map((row) => row.item_id).filter(Boolean))
  );
  const products = await getItemsByIds(productIds);
  const metaById = new Map(products.map((c) => [c.id, c]));

  return (data ?? []).map((row) => ({
    product_item_id: row.item_id,
    quantity: Number(row.quantity ?? 0),
    product: metaById.get(row.item_id ?? ""),
  }));
}
