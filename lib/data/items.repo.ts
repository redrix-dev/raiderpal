/**
 * @fileoverview Item data repository functions for Raider Pal
 *
 * This module provides data access functions for item-related operations,
 * including fetching canonical item data, crafting recipes, recycling outputs,
 * and item relationships. All functions enrich raw database rows with metadata
 * for consistent UI consumption.
 */

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

/**
 * Maps a raw metadata database row to a canonical item summary
 * @param row - Raw metadata row from database
 * @returns Formatted item summary with fallbacks for missing data
 */
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

/**
 * Maps multiple metadata rows to canonical item summaries
 * @param rows - Array of raw metadata rows
 * @returns Array of formatted item summaries
 */
function mapMetadataRows(rows: MetadataRow[]): CanonicalItemSummary[] {
  return rows.map(mapMetadata);
}

/**
 * Removes duplicate IDs from an array while preserving order
 * @param ids - Array of item IDs (may contain duplicates)
 * @returns Array of unique IDs in original order
 */
function dedupeIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

/**
 * Builds a lookup map from item ID to item metadata
 * @param rows - Array of item summaries
 * @returns Map with item ID as key and item data as value
 */
function buildMetaById(rows: CanonicalItemSummary[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

/**
 * Fetches metadata for multiple items by their IDs
 * @param ids - Array of item IDs to fetch
 * @returns Promise resolving to array of item summaries
 */
async function fetchMetadataByIds(ids: string[]): Promise<CanonicalItemSummary[]> {
  if (ids.length === 0) return [];

  const rows = await queryView(VIEW_CONTRACTS.metadata, (q) =>
    q.in("id", dedupeIds(ids))
  );

  return mapMetadataRows(rows);
}

/**
 * Retrieves a single canonical item by its ID
 * @param id - The item ID to fetch
 * @returns Promise resolving to the item data or null if not found
 */
export async function getCanonicalItemById(
  id: string
): Promise<CanonicalItem | null> {
  const row = await queryViewMaybeSingle(VIEW_CONTRACTS.metadata, (q) =>
    q.eq("id", id)
  );

  return row ? (mapMetadata(row) as CanonicalItem) : null;
}

/**
 * Filters for listing canonical items
 */
export type ListItemFilters = {
  /** Search query to match against name, type, or loot area */
  search?: string;
  /** Filter by item rarity */
  rarity?: string;
  /** Filter by item type */
  itemType?: string;
  /** Maximum number of results to return */
  limit?: number;
  /** Number of results to skip (for pagination) */
  offset?: number;
};

/**
 * Lists canonical items with optional filtering and pagination
 * @param filters - Optional filters to apply to the query
 * @returns Promise resolving to array of item summaries
 */
export async function listCanonicalItems(
  filters: ListItemFilters = {}
): Promise<CanonicalItemSummary[]> {
  const rows = await queryView(VIEW_CONTRACTS.metadata, (q) => {
    let next = q.order("name", { ascending: true });

    if (filters.search) {
      const sanitized = filters.search.trim();
      // Whitelist validation: only allow alphanumeric, spaces, hyphens, apostrophes, and periods
      // This prevents PostgREST DSL injection via special characters
      if (!/^[\w\s\-'.]*$/.test(sanitized)) {
        throw new Error("Search query contains invalid characters");
      }
      const query = `%${sanitized}%`;
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

/**
 * Searches for canonical items by query string
 * @param query - Search query to match against items
 * @returns Promise resolving to array of matching item summaries (max 50)
 */
export async function searchCanonicalItems(
  query: string
): Promise<CanonicalItemSummary[]> {
  return listCanonicalItems({ search: query, limit: 50 });
}

/**
 * Retrieves multiple items by their IDs
 * @param ids - Array of item IDs to fetch
 * @returns Promise resolving to array of item summaries
 */
export async function getItemsByIds(
  ids: string[]
): Promise<CanonicalItemSummary[]> {
  if (!ids.length) return [];
  return fetchMetadataByIds(dedupeIds(ids));
}

/**
 * Gets crafting components required to build an item
 * @param itemId - ID of the item to get crafting recipe for
 * @returns Promise resolving to array of crafting components with metadata
 */
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

/**
 * Gets recycling outputs when breaking down an item
 * @param itemId - ID of the item to get recycling outputs for
 * @returns Promise resolving to array of recycling outputs with metadata
 */
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

/**
 * Gets all item IDs involved in recycling relationships
 * @returns Promise resolving to object with needable and haveable item IDs
 */
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

/**
 * Finds the best sources for obtaining a specific component through recycling
 * @param componentId - ID of the component to find sources for
 * @returns Promise resolving to array of recycling sources with metadata, ordered by quantity descending
 */
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

/**
 * Gets items that use a specific component in their crafting recipe
 * @param itemId - ID of the component to find usage for
 * @returns Promise resolving to array of items that use this component
 */
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
