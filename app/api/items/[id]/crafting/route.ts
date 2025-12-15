import { getCraftingForItem } from "@/data/crafting";
import { craftingDataSchema, craftingParamsSchema } from "@/lib/apiSchemas";
import { assertResponseShape, jsonError, jsonOk, type RouteContext } from "@/lib/http";
import type { NextRequest } from "next/server";

export const revalidate = 86400; // refresh daily
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const parsedParams = craftingParamsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return jsonError(parsedParams.error, 400);
  }

  const { id } = parsedParams.data;

  const data = await getCraftingForItem(id);
  const validatedData = assertResponseShape(craftingDataSchema, data);

  return jsonOk(data, 200, {
    "Cache-Control": "public, max-age=900, stale-while-revalidate=85500",
  });
}
