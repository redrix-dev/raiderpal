// /data/items.ts
import { createServerClient } from "@/lib/supabaseServer";
import { DB } from "@/lib/dbRelations";

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

export async function getAllItems(): Promise<ItemListRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from(DB.items) // ✅ NO QUOTES
    .select("id, name, rarity, icon, item_type, value, loot_area")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`getAllItems failed: ${error.message}`);
  }

  return (data ?? []) as ItemListRow[];
}

export async function getItemById(id: string): Promise<ItemRow | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from(DB.items) // ✅ NO QUOTES
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
