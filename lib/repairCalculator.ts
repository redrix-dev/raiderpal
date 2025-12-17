export type MaterialMap = Record<string, number>;

export type ItemEconomy = {
  cheapthreshold: number;
  cheaprepair: MaterialMap;
  expensiverepair: MaterialMap;
  craftcomponents: MaterialMap;
  recycleoutputs?: MaterialMap;
  placeholders?: string[];
};

export type Recommendation = {
  action: "REPAIR" | "REPLACE";
  band: "cheap" | "expensive";
  costs: MaterialMap;
};

function computeCraftNetCosts({
  craftcomponents,
  recycleoutputs,
  placeholders,
}: Pick<ItemEconomy, "craftcomponents" | "recycleoutputs" | "placeholders">): MaterialMap {
  const result: MaterialMap = {};

  Object.entries(craftcomponents).forEach(([id, quantity]) => {
    if (quantity > 0) {
      result[id] = quantity;
    }
  });

  if (recycleoutputs) {
    Object.entries(recycleoutputs).forEach(([id, quantity]) => {
      if (quantity <= 0) return;
      result[id] = Math.max(0, (result[id] ?? 0) - quantity);
      if (result[id] === 0) {
        delete result[id];
      }
    });
  }

  const placeholderIds = new Set(placeholders ?? []);
  placeholderIds.forEach((id) => {
    if (id in result) {
      delete result[id];
    }
  });

  return result;
}

/**
 * Determines whether to repair or replace an item based on current durability.
 *
 * Decision logic:
 * - If durability >= cheapthreshold: use cheap repair cost → recommend REPAIR
 * - If durability < cheapthreshold: use expensive repair cost → recommend REPLACE
 *
 * True craft cost calculation:
 * 1. Start with craftcomponents - recycleoutputs
 * 2. Remove placeholder items (previous-tier weapons, blueprints)
 * 3. Return only actual material costs
 *
 * @param item - Item economy data including repair costs and thresholds
 * @param currentDurability - Current durability value (0 to maxdurability)
 * @returns Recommendation object with action, band, and costs
 */
export function recommendAction(
  item: ItemEconomy,
  currentDurability: number
): Recommendation {
  const band = currentDurability >= item.cheapthreshold ? "cheap" : "expensive";
  const action: Recommendation["action"] = band === "cheap" ? "REPAIR" : "REPLACE";

  const costs =
    band === "cheap"
      ? { ...item.cheaprepair }
      : { ...item.expensiverepair, ...computeCraftNetCosts(item) };

  Object.keys(costs).forEach((key) => {
    if (costs[key] <= 0) {
      delete costs[key];
    }
  });

  return { action, band, costs };
}
