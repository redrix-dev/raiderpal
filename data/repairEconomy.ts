import { createServerClient } from "@/lib/supabaseServer";
import type { ItemEconomy } from "@/lib/repairCalculator";
import { coerceNumber, parseCostList } from "@/lib/dataUtils";

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
