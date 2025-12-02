// data/recycling.ts
import { createServerClient } from "@/lib/supabaseServer";

export type RecyclingSourceRow = {
  source_item_id: string | null;
  quantity: number | null;
  component_id: string | null;
  component_name: string | null;
  component_icon: string | null;
  component_rarity: string | null;
  component_type: string | null;
  component_value: number | null;
};

/**
 * What this item recycles into.
 */
export async function getRecyclingForItem(
  itemId: string
): Promise<RecyclingSourceRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("view_recycling_sources")
    .select(
      `
      source_item_id,
      quantity,
      component_id,
      component_name,
      component_icon,
      component_rarity,
      component_type,
      component_value
      `
    )
    .eq("source_item_id", itemId)
    .order("component_name", { ascending: true });

  if (error) {
    throw new Error(
      `getRecyclingForItem failed for ${itemId}: ${error.message}`
    );
  }

  return (data ?? []) as RecyclingSourceRow[];
}
