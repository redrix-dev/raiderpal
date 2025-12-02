// /data/items.ts
import { createServerClient } from "@/lib/supabaseServer";

export type ItemRow = {
  id: string;
  name: string | null;
  description: string | null;
  item_type: string | null;
  rarity: string | null;
  icon: string | null;
  value: number | null;
  workbench: string | null;
  loot_area: string | null;
};

export type ItemListRow = Pick<
  ItemRow,
  "id" | "name" | "rarity" | "icon" | "item_type" | "value" | "loot_area"
>;

// Used by /items list page
export async function getAllItems(): Promise<ItemListRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("items")
    .select("id, name, rarity, icon, item_type, value, loot_area")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`getAllItems failed: ${error.message}`);
  }

  return (data ?? []) as ItemListRow[];
}

// Used by /items/[id]
export async function getItemById(id: string): Promise<ItemRow | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("items")
    .select(
      "id, name, description, item_type, rarity, icon, value, workbench, loot_area"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getItemById failed for ${id}: ${error.message}`);
  }

  return (data as ItemRow) ?? null;
}
