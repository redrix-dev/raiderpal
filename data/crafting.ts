// /data/crafting.ts
import { createServerClient } from "@/lib/supabaseServer";
import { DB } from "@/lib/dbRelations";

export type CraftingRecipeRow = {
  item_id: string | null;
  quantity: number | null;
  component_id: string | null;
  component_name: string | null;
  component_icon: string | null;
  component_rarity: string | null;
  component_type: string | null;
  component_value: number | null;
};

export async function getCraftingForItem(
  itemId: string
): Promise<CraftingRecipeRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from(DB.crafting) // ✅ NO QUOTES
    .select(
      `
      item_id,
      quantity,
      component_id,
      component_name,
      component_icon,
      component_rarity,
      component_type,
      component_value
      `
    )
    .eq("item_id", itemId)
    .order("component_name", { ascending: true });

  if (error) {
    throw new Error(`getCraftingForItem failed for ${itemId}: ${error.message}`);
  }

  return (data ?? []) as CraftingRecipeRow[];
}
