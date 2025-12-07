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
  cheap_repair_cost: ComponentCost[];
  expensive_repair_cost: ComponentCost[];
  craft_components: ComponentCost[];
  recycle_outputs: ComponentCost[];
};

function toMap(list: ComponentCost[]): Record<string, number> {
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

  const trueCraftCost = subtractMaps(craft, recycle);

  const useCheap = currentDurability >= item.cheap_threshold;
  const repairCost = useCheap ? cheap : expensive;

  return {
    recommendedAction: useCheap ? "REPAIR" as const : "REPLACE" as const,
    repairBand: useCheap ? "cheap" as const : "expensive" as const,
    repairCost,
    trueCraftCost
  };
}
