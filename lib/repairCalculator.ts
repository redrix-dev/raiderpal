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

function toMap(list: ComponentCost[] | null | undefined): Record<string, number> {
  return (list ?? []).reduce((acc, c) => {
    const id = c.component_item_id?.trim();
    if (!id) return acc;

    const qty = Number(c.quantity);
    if (!Number.isFinite(qty)) return acc;

    acc[id] = (acc[id] ?? 0) + qty;
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

/**
 * Determines whether to repair or replace an item based on current durability.
 *
 * Decision logic:
 * - If durability >= cheap_threshold: use cheap repair cost → recommend REPAIR
 * - If durability < cheap_threshold: use expensive repair cost → recommend REPLACE
 *
 * True craft cost calculation:
 * 1. Start with craft_components - recycle_outputs
 * 2. Remove placeholder items (previous-tier weapons, blueprints)
 * 3. Return only actual material costs
 *
 * @param item - Item economy data including repair costs and thresholds
 * @param currentDurability - Current durability value (0 to max_durability)
 * @returns Recommendation object with action, band, and costs
 */
export function recommendAction(item: ItemEconomy, currentDurability: number) {
  if (item.max_durability == null || item.cheap_threshold == null) {
    return { recommendedAction: "UNKNOWN" as const };
  }

  const cheap = toMap(item.cheap_repair_cost);
  const expensive = toMap(item.expensive_repair_cost);
  const craft = toMap(item.craft_components);
  const recycle = toMap(item.recycle_outputs);
  const durability = Math.max(0, Math.min(currentDurability, item.max_durability));

  const trueCraftCost = subtractMaps(craft, recycle);

  const useCheap = durability >= item.cheap_threshold;
  const repairCost = useCheap ? cheap : expensive;

  return {
    recommendedAction: useCheap ? ("REPAIR" as const) : ("REPLACE" as const),
    repairBand: useCheap ? ("cheap" as const) : ("expensive" as const),
    repairCost,
    trueCraftCost,
  };
}
