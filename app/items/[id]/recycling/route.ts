import { getRecyclingForItem } from "@/data/recycling";
import type { NextRequest } from "next/server";
import { jsonError, type RouteContext } from "@/lib/http";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<Params>
) {
  const { id } = await params;

  if (!id || typeof id !== "string" || !id.trim()) {
    return jsonError("Missing or invalid id", 400);
  }

  const data = await getRecyclingForItem(id.trim());

  if (!data) {
    return jsonError("Item not found", 404);
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
