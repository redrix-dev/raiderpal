import { createSupabaseServerClient } from "./db/server";
import type {
  CanonicalItemSummary,
  RepairProfile,
  RepairRecipeRow,
  RepairRecipeWithComponent,
  RepairSanityCheck,
} from "./db/types";
import { getItemsByIds } from "./items.repo";
import { computeRepairCost, computeRepairCycles } from "./repairs.math";

const REPAIR_PROFILES = "rp_repair_profiles";
const REPAIR_RECIPES_VIEW = "rp_view_repair_recipes";

export type RepairableItem = {
  item: CanonicalItemSummary;
  profile: RepairProfile;
  recipe: RepairRecipeWithComponent[];
};

export async function getRepairProfile(
  itemId: string
): Promise<RepairProfile | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(REPAIR_PROFILES)
    .select("item_id, max_durability, step_durability, notes")
    .eq("item_id", itemId)
    .maybeSingle();

  if (error) {
    throw new Error(`getRepairProfile failed for ${itemId}: ${error.message}`);
  }

  if (!data) return null;

  return {
    item_id: data.item_id,
    max_durability: Number(data.max_durability ?? 0),
    step_durability: Number(data.step_durability ?? 50),
    notes: data.notes ?? null,
  };
}

export async function getRepairRecipeRows(
  itemId: string
): Promise<RepairRecipeRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(REPAIR_RECIPES_VIEW)
    .select("item_id, component_item_id, quantity_per_cycle")
    .eq("item_id", itemId)
    .order("component_item_id", { ascending: true });

  if (error) {
    throw new Error(`getRepairRecipeRows failed for ${itemId}: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    item_id: row.item_id,
    component_item_id: row.component_item_id,
    quantity_per_cycle: Number(row.quantity_per_cycle ?? 0),
  }));
}

export async function getRepairRecipeWithComponents(
  itemId: string
): Promise<RepairRecipeWithComponent[]> {
  const rows = await getRepairRecipeRows(itemId);
  const componentIds = Array.from(
    new Set(rows.map((r) => r.component_item_id).filter(Boolean))
  );
  const componentMeta = await getItemsByIds(componentIds);
  const metaById = new Map(componentMeta.map((m) => [m.id, m]));

  return rows.map((row) => ({
    ...row,
    component: metaById.get(row.component_item_id) ?? null,
  }));
}

export async function listRepairableItems(): Promise<RepairableItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(REPAIR_PROFILES)
    .select("item_id, max_durability, step_durability, notes")
    .order("item_id", { ascending: true });

  if (error) {
    throw new Error(`listRepairableItems failed: ${error.message}`);
  }

  const profiles: RepairProfile[] = (data ?? []).map((row) => ({
    item_id: row.item_id,
    max_durability: Number(row.max_durability ?? 0),
    step_durability: Number(row.step_durability ?? 50),
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
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(REPAIR_RECIPES_VIEW)
    .select("item_id, component_item_id, quantity_per_cycle");

  if (error) {
    throw new Error(`getAllRepairRecipes failed: ${error.message}`);
  }

  const componentIds = Array.from(
    new Set((data ?? []).map((row) => row.component_item_id).filter(Boolean))
  );
  const componentMeta = await getItemsByIds(componentIds);
  const metaById = new Map(componentMeta.map((m) => [m.id, m]));

  return (data ?? []).map((row) => ({
    item_id: row.item_id,
    component_item_id: row.component_item_id,
    quantity_per_cycle: Number(row.quantity_per_cycle ?? 0),
    component: metaById.get(row.component_item_id ?? "") ?? null,
  }));
}

export async function listRepairProfilesMissingRecipes() {
  const supabase = createSupabaseServerClient();
  const { data: profileRows, error: profileError } = await supabase
    .from(REPAIR_PROFILES)
    .select("item_id");

  if (profileError) {
    throw new Error(
      `listRepairProfilesMissingRecipes failed: ${profileError.message}`
    );
  }

  const { data: recipeRows, error: recipeError } = await supabase
    .from(REPAIR_RECIPES_VIEW)
    .select("item_id");

  if (recipeError) {
    throw new Error(`listRepairProfilesMissingRecipes failed: ${recipeError.message}`);
  }

  const recipeSet = new Set((recipeRows ?? []).map((r) => r.item_id));
  const missingIds = (profileRows ?? [])
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
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(REPAIR_RECIPES_VIEW)
    .select("component_item_id, quantity_per_cycle");

  if (error) {
    throw new Error(`repairSanityCheck failed: ${error.message}`);
  }

  let bad_component_ids = 0;
  let bad_qty = 0;

  for (const row of data ?? []) {
    const compId = row.component_item_id;
    const qty = Number(row.quantity_per_cycle);
    if (!compId || compId.trim() === "") bad_component_ids += 1;
    if (!Number.isFinite(qty) || qty <= 0) bad_qty += 1;
  }

  return { bad_component_ids, bad_qty };
}

export async function listItemsUsingComponent(
  componentId: string
): Promise<RepairRecipeWithComponent[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(REPAIR_RECIPES_VIEW)
    .select("item_id, component_item_id, quantity_per_cycle")
    .eq("component_item_id", componentId)
    .order("item_id", { ascending: true });

  if (error) {
    throw new Error(
      `listItemsUsingComponent failed for ${componentId}: ${error.message}`
    );
  }

  const itemIds = Array.from(
    new Set((data ?? []).map((row) => row.item_id).filter(Boolean))
  );
  const items = await getItemsByIds(itemIds);
  const itemById = new Map(items.map((i) => [i.id, i]));

  return (data ?? []).map((row) => ({
    item_id: row.item_id,
    component_item_id: row.component_item_id,
    quantity_per_cycle: Number(row.quantity_per_cycle ?? 0),
    component: itemById.get(row.item_id ?? "") ?? null,
  }));
}

