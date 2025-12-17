import { VIEW_CONTRACTS, type MetadataRow } from "./db/contracts";
import { queryView, queryViewMaybeSingle } from "./db/query";
import type {
  CanonicalItem,
  CanonicalItemSummary,
  CraftingComponentRow,
  RecyclingOutputRow,
  RecyclingSourceRow,
  UsedInRow,
} from "./db/types";

function mapMetadata(row: MetadataRow): CanonicalItemSummary {
  return {
    id: row.id,
    name: row.name ?? row.id,
    description: row.description ?? null,
    item_type: row.item_type ?? null,
    rarity: row.rarity ?? null,
    icon: row.icon ?? null,
    value: row.value ?? null,
    workbench: row.workbench ?? null,
    loot_area: row.loot_area ?? null,
  };
}

function mapMetadataRows(rows: MetadataRow[]): CanonicalItemSummary[] {
  return rows.map(mapMetadata);
}

function dedupeIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

function buildMetaById(rows: CanonicalItemSummary[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

async function fetchMetadataByIds(ids: string[]): Promise<CanonicalItemSummary[]> {
  if (ids.length === 0) return [];

  const rows = await queryView(VIEW_CONTRACTS.metadata, (q) =>
    q.in("id", dedupeIds(ids))
  );

  return mapMetadataRows(rows);
}

export async function getCanonicalItemById(
  id: string
): Promise<CanonicalItem | null> {
  const row = await queryViewMaybeSingle(VIEW_CONTRACTS.metadata, (q) =>
    q.eq("id", id)
  );

  return row ? (mapMetadata(row) as CanonicalItem) : null;
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
  const rows = await queryView(VIEW_CONTRACTS.metadata, (q) => {
    let next = q.order("name", { ascending: true });

    if (filters.search) {
      const query = `%${filters.search.trim()}%`;
      next = next.or(`name.ilike.${query},item_type.ilike.${query},loot_area.ilike.${query}`);
    }

    if (filters.rarity) {
      next = next.eq("rarity", filters.rarity);
    }

    if (filters.itemType) {
      next = next.eq("item_type", filters.itemType);
    }

    if (typeof filters.limit === "number") {
      const from = filters.offset ?? 0;
      next = next.range(from, from + filters.limit - 1);
    }

    return next;
  });

  return mapMetadataRows(rows);
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
  return fetchMetadataByIds(dedupeIds(ids));
}

export async function getCraftingForItem(
  itemId: string
): Promise<CraftingComponentRow[]> {
  const rows = await queryView(VIEW_CONTRACTS.crafting, (q) =>
    q.eq("item_id", itemId).order("component_id", { ascending: true })
  );

  const components = await fetchMetadataByIds(dedupeIds(rows.map((row) => row.component_id)));
  const metaById = buildMetaById(components);

  return rows.map((row) => ({
    item_id: row.item_id,
    component_id: row.component_id,
    quantity: row.total_quantity,
    component: metaById.get(row.component_id) ?? null,
  }));
}

export async function getRecyclingForItem(
  itemId: string
): Promise<RecyclingOutputRow[]> {
  const rows = await queryView(VIEW_CONTRACTS.recycling, (q) =>
    q.eq("item_id", itemId).order("component_id", { ascending: true })
  );

  const components = await fetchMetadataByIds(dedupeIds(rows.map((row) => row.component_id)));
  const metaById = buildMetaById(components);

  return rows.map((row) => ({
    item_id: row.item_id,
    component_id: row.component_id,
    quantity: row.quantity,
    component: metaById.get(row.component_id) ?? null,
  }));
}

export async function getRecyclingIdSets(): Promise<{
  needableIds: string[];
  haveableIds: string[];
}> {
  const rows = await queryView(VIEW_CONTRACTS.recycling);

  const needableIds = new Set<string>();
  const haveableIds = new Set<string>();

  for (const row of rows) {
    if (row.component_id) needableIds.add(row.component_id);
    if (row.item_id) haveableIds.add(row.item_id);
  }

  return {
    needableIds: Array.from(needableIds),
    haveableIds: Array.from(haveableIds),
  };
}

export async function getBestSourcesForItem(
  componentId: string
): Promise<RecyclingSourceRow[]> {
  const rows = await queryView(VIEW_CONTRACTS.recycling, (q) =>
    q.eq("component_id", componentId).order("quantity", { ascending: false })
  );

  const sourceIds = dedupeIds(rows.map((row) => row.item_id));
  const sources = await fetchMetadataByIds(sourceIds);
  const metaById = buildMetaById(sources);

  return rows.map((row) => ({
    source_item_id: row.item_id,
    component_id: row.component_id,
    quantity: row.quantity,
    source: metaById.get(row.item_id) ?? null,
  }));
}

export async function getUsedInForItem(itemId: string): Promise<UsedInRow[]> {
  const rows = await queryView(VIEW_CONTRACTS.crafting, (q) =>
    q.eq("component_id", itemId).order("item_id", { ascending: true })
  );

  const productIds = dedupeIds(rows.map((row) => row.item_id));
  const products = await fetchMetadataByIds(productIds);
  const metaById = buildMetaById(products);

  return rows.map((row) => ({
    product_item_id: row.item_id,
    quantity: row.total_quantity,
    product: metaById.get(row.item_id) ?? null,
  }));
}
