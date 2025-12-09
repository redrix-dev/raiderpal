import type { ComponentCost } from "@/lib/repairCalculator";

export function coerceNumber(
  value: number | string | null | undefined
): number | null {
  if (value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeComponentCost(entry: any): ComponentCost | null {
  const source = entry?.component ?? entry;
  const componentId =
    source?.component_item_id ??
    source?.id ??
    entry?.component_item_id ??
    entry?.id;

  const quantity = Number(entry?.quantity ?? source?.quantity);
  if (!componentId || !Number.isFinite(quantity)) return null;

  return {
    component_item_id: String(componentId),
    quantity,
    name: source?.name ?? entry?.name ?? null,
    rarity: source?.rarity ?? entry?.rarity ?? null,
    item_type: source?.item_type ?? entry?.item_type ?? null,
    icon: source?.icon ?? entry?.icon ?? null,
  };
}

export function parseCostList(value: unknown): ComponentCost[] {
  return parseJsonArray(value)
    .map((entry) => normalizeComponentCost(entry))
    .filter((c): c is ComponentCost => Boolean(c));
}
