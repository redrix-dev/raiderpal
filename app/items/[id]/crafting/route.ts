import { createServerClient } from "@/lib/supabaseServer";
import type { NextRequest } from "next/server";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  if (!id || typeof id !== "string" || !id.trim()) {
    return new Response(JSON.stringify({ error: "Invalid item id" }), {
      status: 400,
    });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("view_crafting_recipes")
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
    .eq("item_id", id.trim());

  if (error) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }

  return Response.json(data ?? []);
}
