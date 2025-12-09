// app/items/[id]/sources/route.ts
import type { NextRequest } from "next/server";
import { getBestSourcesForItem } from "@/data/yields";
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

  const sources = await getBestSourcesForItem(id.trim());

  if (!sources) {
    return jsonError("Item not found", 404);
  }

  return new Response(JSON.stringify(sources), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
