import { getBestSourcesForItem } from "@/data/yields";
import type { NextRequest } from "next/server";
import { jsonError, jsonOk, type RouteContext } from "@/lib/http";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<Params>
) {
  const { id } = await params;
  const normalizedId = typeof id === "string" ? id.trim() : "";

  if (!normalizedId) {
    return jsonError("Missing or invalid id", 400);
  }

  const sources = await getBestSourcesForItem(normalizedId);

  if (!sources) {
    return jsonError("Item not found", 404);
  }

  return jsonOk(sources);
}
