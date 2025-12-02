import { createServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("items")
    .select("id, name, icon, rarity, item_type")
    .order("name");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return Response.json(data);
}
