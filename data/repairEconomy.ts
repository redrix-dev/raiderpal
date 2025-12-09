import { createServerClient } from "@/lib/supabaseServer";
import type { ComponentCost, ItemEconomy } from "@/lib/repairCalculator";

export type RepairEconomyRow = ItemEconomy & {
  rarity?: string | null;
  icon?: string | null;
  item_type?: string | null;
};

type RawRow = {
  id: string;
  name?: string | null;
  item_type?: string | null;
  rarity?: string | null;
  icon?: string | null;
  max_durability?: number | string | null;
  cheap_threshold?: number | string | null;
  required_item_id?: string | null;
  net_upgrade_cost?: unknown;
  cheap_repair_cost?: unknown;
  expensive_repair_cost?: unknown;
  craft_components?: unknown;
  recycle_outputs?: unknown;
};

function parseJsonArray(value: unknown): unknown[] {
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

function coerceNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
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

function parseCostList(value: unknown): ComponentCost[] {
  return parseJsonArray(value)
    .map((entry) => normalizeComponentCost(entry))
    .filter((c): c is ComponentCost => Boolean(c));
}

/**
 * Fetches the consolidated repair/craft/recycle economics for all items.
 * The Supabase view (view_repairable_items) returns cost fields as JSON strings;
 * we normalize them to structured arrays here.
 */
export async function getRepairEconomy(): Promise<RepairEconomyRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("view_repairable_items")
    .select(
      `
      id,
      name,
      item_type,
      rarity,
      icon,
      max_durability,
      cheap_threshold,
      required_item_id,
      net_upgrade_cost,
      cheap_repair_cost,
      expensive_repair_cost,
      craft_components,
      recycle_outputs
    `
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`getRepairEconomy failed: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const r = row as RawRow;
    return {
      id: r.id,
      name: r.name ?? r.id,
      item_type: r.item_type ?? null,
      rarity: r.rarity ?? null,
      icon: r.icon ?? null,
      max_durability: coerceNumber(r.max_durability),
      cheap_threshold: coerceNumber(r.cheap_threshold),
      required_item_id: r.required_item_id ?? null,
      net_upgrade_cost: parseCostList(r.net_upgrade_cost),
      cheap_repair_cost: parseCostList(r.cheap_repair_cost),
      expensive_repair_cost: parseCostList(r.expensive_repair_cost),
      craft_components: parseCostList(r.craft_components),
      recycle_outputs: parseCostList(r.recycle_outputs),
    };
  });
}
