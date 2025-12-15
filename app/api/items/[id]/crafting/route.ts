import { getCraftingForItem } from "@/data/crafting";
import { craftingDataSchema, craftingParamsSchema } from "@/lib/apiSchemas";
import { assertResponseShape, jsonError, jsonOk, type RouteContext } from "@/lib/http";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
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

  return jsonOk(validatedData, 200, {
    "Cache-Control": "no-store",
  });
}
