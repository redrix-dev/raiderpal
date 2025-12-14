// /data/recycling.ts
import { createServerClient } from "@/lib/supabaseServer";
import { DB } from "@/lib/dbRelations";

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

export async function getRecyclingForItem(
  itemId: string
): Promise<RecyclingSourceRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from(DB.recycling) // ✅ NO QUOTES
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
    throw new Error(`getRecyclingForItem failed for ${itemId}: ${error.message}`);
  }

  return (data ?? []) as RecyclingSourceRow[];
}

export async function getRecyclingIdSets(): Promise<{
  needableIds: string[];
  haveableIds: string[];
}> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from(DB.recycling) // ✅ NO QUOTES
    .select(`source_item_id, component_id`);

  if (error) {
    throw new Error(`getRecyclingIdSets failed: ${error.message}`);
  }

  const needableIds = new Set<string>();
  const haveableIds = new Set<string>();

  for (const row of data ?? []) {
    const sourceId = row.source_item_id as string | null;
    const componentId = row.component_id as string | null;
    if (componentId) needableIds.add(componentId);
    if (sourceId) haveableIds.add(sourceId);
  }

  return {
    needableIds: Array.from(needableIds),
    haveableIds: Array.from(haveableIds),
  };
}

export async function getRecyclingItemTypes(): Promise<string[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from(DB.recycling) // ✅ NO QUOTES
    .select("component_type")
    .not("component_type", "is", null);

  if (error) {
    throw new Error(`getRecyclingItemTypes failed: ${error.message}`);
  }

  const types = new Set<string>();
  for (const row of data ?? []) {
    const t = row.component_type as string | null;
    if (t && t.trim()) types.add(t.trim());
  }

  return Array.from(types).sort((a, b) => a.localeCompare(b));
}
