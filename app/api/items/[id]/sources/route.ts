import type { NextRequest } from "next/server";
import { itemParamsSchema, sourcesDataSchema } from "@/lib/apiSchemas";
import { getBestSourcesForItem, getCanonicalItemById } from "@/lib/data";
import {
  assertResponseShape,
  formatValidationError,
  jsonError,
  jsonOk,
  jsonErrorFromException,
  type RouteContext,
} from "@/lib/http";

export const revalidate = 86400; // refresh daily
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const parsedParams = itemParamsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return jsonError(
      "invalid_params",
      formatValidationError(String(parsedParams.error)),
      400
    );
  }

  const { id } = parsedParams.data;

  try {
    const item = await getCanonicalItemById(id);
    if (!item) {
      return jsonError("not_found", "Item not found", 404);
    }
    const sources = await getBestSourcesForItem(id);
    const validated = assertResponseShape(sourcesDataSchema, sources);

    return jsonOk(validated, 200, {
      "Cache-Control": "public, max-age=900, stale-while-revalidate=85500",
    });
  } catch (err) {
    return jsonErrorFromException(err);
  }
}
