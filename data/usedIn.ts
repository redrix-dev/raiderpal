// /data/usedIn.ts
import { createServerClient } from "@/lib/supabaseServer";
import { DB } from "@/lib/dbRelations";

export type UsedInRow = {
  product_id: string | null;
  product_name: string | null;
  product_icon: string | null;
  product_rarity: string | null;
  product_type: string | null;
  product_value: number | null;
  quantity: number | null;
};

export async function getUsedInForItem(itemId: string): Promise<UsedInRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from(DB.usedIn) // ✅ NO QUOTES
    .select(
      `
      component_id,
      quantity,
      result_item_id,
      result_item_name,
      result_item_icon,
      result_item_rarity,
      result_item_type,
      result_item_value
      `
    )
    .eq("component_id", itemId)
    .order("result_item_name", { ascending: true });

  if (error) {
    throw new Error(`getUsedInForItem failed for ${itemId}: ${error.message}`);
  }

  type UsedInViewRow = {
    result_item_id: string | null;
    result_item_name: string | null;
    result_item_icon: string | null;
    result_item_rarity: string | null;
    result_item_type: string | null;
    result_item_value: number | null;
    quantity: number | null;
  };

  const rows = (data ?? []) as UsedInViewRow[];

  return rows.map((row) => ({
    product_id: row.result_item_id,
    product_name: row.result_item_name,
    product_icon: row.result_item_icon,
    product_rarity: row.result_item_rarity,
    product_type: row.result_item_type,
    product_value: row.result_item_value,
    quantity: row.quantity,
  }));
}
