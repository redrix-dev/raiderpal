import { VIEW_CONTRACTS } from "./db/contracts";
import { queryView, queryViewMaybeSingle } from "./db/query";
import type {
  RepairProfile,
  RepairRecipeRow,
  RepairRecipeWithComponent,
  RepairSanityCheck,
  RepairableItem,
  CraftingComponentRow,
  RecyclingOutputRow,
} from "./db/types";
import { getItemsByIds } from "./items.repo";

export async function getRepairProfile(
  itemId: string
): Promise<RepairProfile | null> {
  const [row, legacyRow] = await Promise.all([
    queryViewMaybeSingle(VIEW_CONTRACTS.repairProfiles, (q) =>
      q.eq("item_id", itemId)
    ),
    queryViewMaybeSingle(VIEW_CONTRACTS.legacyRepairProfiles, (q) =>
      q.eq("item_id", itemId)
    ),
  ]);

  const normalized = normalizeProfileRow(row ?? legacyRow);
  if (!normalized) return null;

  return normalized;
}

export async function getRepairRecipeRows(
  itemId: string
): Promise<RepairRecipeRow[]> {
  const rows = await queryView(VIEW_CONTRACTS.repairRecipes, (q) =>
    q
      .eq("item_id", itemId)
      .order("component_id", { ascending: true })
  );

  return rows.map((row) => ({
    item_id: row.item_id,
    component_id: row.component_id,
    quantity_per_cycle: row.quantity_per_cycle,
  }));
}

export async function getRepairRecipeWithComponents(
  itemId: string
): Promise<RepairRecipeWithComponent[]> {
  const rows = await getRepairRecipeRows(itemId);
  const componentIds = Array.from(new Set(rows.map((r) => r.component_id).filter(Boolean)));
  const componentMeta = await getItemsByIds(componentIds);
  const metaById = new Map(componentMeta.map((m) => [m.id, m]));

  return rows.map((row) => ({
    ...row,
    component: metaById.get(row.component_id) ?? null,
  }));
}

export async function listRepairableItems(): Promise<RepairableItem[]> {
  const profileRows = await fetchRepairProfiles();

  const itemIds = profileRows.map((p) => p.item_id);
  const items = await getItemsByIds(itemIds);
  const itemById = new Map(items.map((i) => [i.id, i]));

  const recipes = await getAllRepairRecipes(itemIds);
  const recipesByItem = recipes.reduce<Record<string, RepairRecipeWithComponent[]>>(
    (acc, row) => {
      acc[row.item_id] = acc[row.item_id] ?? [];
      acc[row.item_id].push(row);
      return acc;
    },
    {}
  );

  const { craftingByItem, recyclingByItem } = await getCraftingAndRecyclingByItem(
    itemIds
  );

  return profileRows
    .map((profile) => {
      const item = itemById.get(profile.item_id);
      if (!item) return null;
      return {
        item,
        profile,
        recipe: recipesByItem[profile.item_id] ?? [],
        crafting: craftingByItem[profile.item_id] ?? [],
        recycling: recyclingByItem[profile.item_id] ?? [],
      };
    })
    .filter((r): r is RepairableItem => Boolean(r));
}

async function getAllRepairRecipes(itemIds: string[]): Promise<RepairRecipeWithComponent[]> {
  const rows = await queryView(VIEW_CONTRACTS.repairRecipes, (q) =>
    itemIds.length ? q.in("item_id", itemIds) : q
  );

  const componentIds = Array.from(new Set(rows.map((row) => row.component_id).filter(Boolean)));
  const componentMeta = await getItemsByIds(componentIds);
  const metaById = new Map(componentMeta.map((m) => [m.id, m]));

  return rows.map((row) => ({
    item_id: row.item_id,
    component_id: row.component_id,
    quantity_per_cycle: row.quantity_per_cycle,
    component: metaById.get(row.component_id ?? "") ?? null,
  }));
}

async function fetchRepairProfiles(): Promise<RepairProfile[]> {
  const rows = await queryView(VIEW_CONTRACTS.repairProfiles, (q) =>
    q.order("item_id", { ascending: true })
  );

  const normalized = rows
    .map((row) => normalizeProfileRow(row))
    .filter((row): row is RepairProfile => Boolean(row));

  if (normalized.length > 0) {
    return normalized;
  }

  const legacyRows = await queryView(
    VIEW_CONTRACTS.legacyRepairProfiles,
    (q) => q.order("item_id", { ascending: true })
  );

  return legacyRows
    .map((row) => normalizeProfileRow(row))
    .filter((row): row is RepairProfile => Boolean(row));
}

function normalizeProfileRow(
  row: { id?: string; item_id?: string; max_durability: number; step_durability: number; notes?: string | null } | null
): RepairProfile | null {
  if (!row) return null;

  const item_id = row.item_id ?? row.id;
  if (!item_id) return null;

  return {
    item_id,
    max_durability: row.max_durability,
    step_durability: row.step_durability,
    notes: row.notes ?? null,
  };
}

async function getCraftingAndRecyclingByItem(itemIds: string[]) {
  if (!itemIds.length) {
    return { craftingByItem: {}, recyclingByItem: {} };
  }

  const [craftingRows, recyclingRows] = await Promise.all([
    queryView(VIEW_CONTRACTS.crafting, (q) =>
      q.in("item_id", itemIds).order("component_id", { ascending: true })
    ),
    queryView(VIEW_CONTRACTS.recycling, (q) =>
      q.in("item_id", itemIds).order("component_id", { ascending: true })
    ),
  ]);

  const componentIds = Array.from(
    new Set(
      [...craftingRows, ...recyclingRows].map((row) => row.component_id).filter(Boolean)
    )
  );
  const componentMeta = await getItemsByIds(componentIds);
  const metaById = new Map(componentMeta.map((m) => [m.id, m]));

  const craftingByItem = craftingRows.reduce<Record<string, CraftingComponentRow[]>>(
    (acc, row) => {
      acc[row.item_id] = acc[row.item_id] ?? [];
      acc[row.item_id].push({
        item_id: row.item_id,
        component_id: row.component_id,
        quantity: row.total_quantity,
        component: metaById.get(row.component_id) ?? null,
      });
      return acc;
    },
    {}
  );

  const recyclingByItem = recyclingRows.reduce<Record<string, RecyclingOutputRow[]>>(
    (acc, row) => {
      acc[row.item_id] = acc[row.item_id] ?? [];
      acc[row.item_id].push({
        component_id: row.component_id,
        quantity: row.quantity,
        item_id: row.item_id,
        component: metaById.get(row.component_id) ?? null,
      });
      return acc;
    },
    {}
  );

  return { craftingByItem, recyclingByItem };
}

export async function listRepairProfilesMissingRecipes() {
  const profileRows = await queryView(VIEW_CONTRACTS.repairProfiles);

  const recipeRows = await queryView(VIEW_CONTRACTS.repairRecipes);

  const recipeSet = new Set(recipeRows.map((r) => r.item_id));
  const missingIds = profileRows
    .map((r) => r.item_id as string)
    .filter((id) => !recipeSet.has(id));

  const meta = await getItemsByIds(missingIds);

  return meta.map((item) => ({
    item_id: item.id,
    name: item.name,
    item_type: item.item_type,
    rarity: item.rarity,
  }));
}

export async function repairSanityCheck(): Promise<RepairSanityCheck> {
  const rows = await queryView(VIEW_CONTRACTS.repairRecipes);

  let bad_component_ids = 0;
  let bad_qty = 0;

  for (const row of rows) {
    const compId = row.component_id;
    const qty = row.quantity_per_cycle;
    if (!compId || compId.trim() === "") bad_component_ids += 1;
    if (!Number.isFinite(qty) || qty <= 0) bad_qty += 1;
  }

  return { bad_component_ids, bad_qty };
}

export async function listItemsUsingComponent(
  componentId: string
): Promise<RepairRecipeWithComponent[]> {
  const rows = await queryView(VIEW_CONTRACTS.repairRecipes, (q) =>
    q
      .eq("component_id", componentId)
      .order("item_id", { ascending: true })
  );

  const itemIds = Array.from(new Set(rows.map((row) => row.item_id).filter(Boolean)));
  const items = await getItemsByIds(itemIds);
  const itemById = new Map(items.map((i) => [i.id, i]));

  return rows.map((row) => ({
    item_id: row.item_id,
    component_id: row.component_id,
    quantity_per_cycle: row.quantity_per_cycle,
    component: itemById.get(row.item_id ?? "") ?? null,
  }));
}
