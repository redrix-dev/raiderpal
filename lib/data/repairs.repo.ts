import { VIEW_CONTRACTS } from "./db/contracts";
import { queryView, queryViewMaybeSingle } from "./db/query";
import type {
  RepairProfile,
  RepairRecipeRow,
  RepairRecipeWithComponent,
  RepairSanityCheck,
  RepairableItem,
} from "./db/types";
import { getItemsByIds } from "./items.repo";

export async function getRepairProfile(
  itemId: string
): Promise<RepairProfile | null> {
  const row = await queryViewMaybeSingle(VIEW_CONTRACTS.repairProfiles, (q) =>
    q.eq("item_id", itemId)
  );

  if (!row) return null;

  return {
    item_id: row.item_id,
    max_durability: row.max_durability,
    step_durability: row.step_durability,
    notes: row.notes ?? null,
  };
}

export async function getRepairRecipeRows(
  itemId: string
): Promise<RepairRecipeRow[]> {
  const rows = await queryView(VIEW_CONTRACTS.repairRecipes, (q) =>
    q.eq("item_id", itemId).order("component_id", { ascending: true })
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
  const profileRows = await queryView(VIEW_CONTRACTS.repairProfiles, (q) =>
    q.order("item_id", { ascending: true })
  );

  const profiles: RepairProfile[] = profileRows.map((row) => ({
    item_id: row.item_id,
    max_durability: row.max_durability,
    step_durability: row.step_durability,
    notes: row.notes ?? null,
  }));

  const itemIds = profiles.map((p) => p.item_id);
  const items = await getItemsByIds(itemIds);
  const itemById = new Map(items.map((i) => [i.id, i]));

  const recipes = await getAllRepairRecipes();
  const recipesByItem = recipes.reduce<Record<string, RepairRecipeWithComponent[]>>(
    (acc, row) => {
      acc[row.item_id] = acc[row.item_id] ?? [];
      acc[row.item_id].push(row);
      return acc;
    },
    {}
  );

  return profiles
    .map((profile) => {
      const item = itemById.get(profile.item_id);
      if (!item) return null;
      return {
        item,
        profile,
        recipe: recipesByItem[profile.item_id] ?? [],
      };
    })
    .filter((r): r is RepairableItem => Boolean(r));
}

async function getAllRepairRecipes(): Promise<RepairRecipeWithComponent[]> {
  const rows = await queryView(VIEW_CONTRACTS.repairRecipes);

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
    q.eq("component_id", componentId).order("item_id", { ascending: true })
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
