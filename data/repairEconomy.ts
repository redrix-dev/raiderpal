import { createServerClient } from "@/lib/supabaseServer";
import type { ItemEconomy } from "@/lib/repairCalculator";

export type RepairEconomyRow = ItemEconomy & {
  rarity?: string | null;
  icon?: string | null;
  item_type?: string | null;
};

/**
 * Fetches the consolidated repair/craft/recycle economics for all items.
 * Expects the Supabase view to expose the JSON arrays:
 * cheap_repair_cost, expensive_repair_cost, craft_components, recycle_outputs.
 */
export async function getRepairEconomy(): Promise<RepairEconomyRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("view_item_economy")
    .select(
      `
      id,
      name,
      item_type,
      rarity,
      icon,
      max_durability,
      cheap_threshold,
      cheap_repair_cost,
      expensive_repair_cost,
      craft_components,
      recycle_outputs,
      required_item_id,
      net_upgrade_cost
    `
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`getRepairEconomy failed: ${error.message}`);
  }

  return (data ?? []) as RepairEconomyRow[];
}
