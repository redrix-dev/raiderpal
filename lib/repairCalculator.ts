export type ComponentCost = {
  component_item_id: string;
  quantity: number;
  name?: string | null;
  rarity?: string | null;
  item_type?: string | null;
  icon?: string | null;
};

export type ItemEconomy = {
  id: string;
  name: string;
  item_type?: string | null;
  rarity?: string | null;
  icon?: string | null;
  max_durability: number | null;
  cheap_threshold: number | null;
  required_item_id?: string | null;
  net_upgrade_cost?: ComponentCost[];
  cheap_repair_cost: ComponentCost[];
  expensive_repair_cost: ComponentCost[];
  craft_components: ComponentCost[];
  recycle_outputs: ComponentCost[];
};

function toMap(list: ComponentCost[] = []): Record<string, number> {
  return list.reduce((acc, c) => {
    acc[c.component_item_id] = (acc[c.component_item_id] ?? 0) + c.quantity;
    return acc;
  }, {} as Record<string, number>);
}

function subtractMaps(
  a: Record<string, number>,
  b: Record<string, number>
): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = (out[k] ?? 0) - v;
    if (out[k] === 0) delete out[k];
  }
  return out;
}

export function recommendAction(
  item: ItemEconomy,
  currentDurability: number
) {
  if (item.max_durability == null || item.cheap_threshold == null) {
    return { recommendedAction: "UNKNOWN" as const };
  }

  const cheap = toMap(item.cheap_repair_cost);
  const expensive = toMap(item.expensive_repair_cost);
  const craft = toMap(item.craft_components);
  const recycle = toMap(item.recycle_outputs);

  // Prefer the raw craft minus recycle math so we keep credit/outputs in view.
  const rawTrueCraft = subtractMaps(craft, recycle);

  // Remove any placeholder/base item from the net craft cost (e.g., Anvil I inside Anvil II).
  const trueCraftCost = { ...rawTrueCraft };
  const normalize = (id: string | null | undefined) =>
    (id ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const placeholderId = normalize(item.required_item_id ?? item.id);
  for (const key of Object.keys(trueCraftCost)) {
    const keyLower = normalize(key);
    const isPlaceholder =
      placeholderId &&
      (keyLower === placeholderId || keyLower === `${placeholderId}blueprint`);
    const isBlueprint = keyLower.includes("blueprint");
    if (isPlaceholder || isBlueprint) {
      delete trueCraftCost[key];
    }
  }

  const useCheap = currentDurability >= item.cheap_threshold;
  const repairCost = useCheap ? cheap : expensive;

  return {
    recommendedAction: useCheap ? "REPAIR" as const : "REPLACE" as const,
    repairBand: useCheap ? "cheap" as const : "expensive" as const,
    repairCost,
    trueCraftCost
  };
}
