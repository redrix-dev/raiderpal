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

type ComponentLike = Record<string, unknown>;

function toRecord(value: unknown): ComponentLike | null {
  return value && typeof value === "object" ? (value as ComponentLike) : null;
}

function readString(obj: ComponentLike, key: string): string | null {
  const value = obj[key];
  return typeof value === "string" ? value : null;
}

function readNumber(obj: ComponentLike, key: string): number | null {
  const value = obj[key];
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeComponentCost(entry: unknown): ComponentCost | null {
  const record = toRecord(entry);
  if (!record) return null;

  const source = toRecord(record.component) ?? record;

  const componentId =
    readString(source, "component_item_id") ??
    readString(source, "id") ??
    readString(record, "component_item_id") ??
    readString(record, "id");

  const quantity =
    readNumber(record, "quantity") ?? readNumber(source, "quantity");
  if (!componentId || quantity == null) return null;

  return {
    component_item_id: componentId,
    quantity,
    name: readString(source, "name") ?? readString(record, "name"),
    rarity: readString(source, "rarity") ?? readString(record, "rarity"),
    item_type:
      readString(source, "item_type") ?? readString(record, "item_type"),
    icon: readString(source, "icon") ?? readString(record, "icon"),
  };
}

export function parseCostList(value: unknown): ComponentCost[] {
  return parseJsonArray(value)
    .map((entry) => normalizeComponentCost(entry))
    .filter((c): c is ComponentCost => Boolean(c));
}
