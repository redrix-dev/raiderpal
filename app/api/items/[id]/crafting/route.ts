import { craftingDataSchema, craftingParamsSchema } from "@/lib/apiSchemas";
import { REVALIDATE } from "@/lib/constants";
import { getCraftingForItem } from "@/lib/data";
import {
  assertResponseShape,
  formatValidationError,
  jsonError,
  jsonOk,
  type RouteContext,
} from "@/lib/http";
import type { NextRequest } from "next/server";

export const revalidate = REVALIDATE.DAILY; // refresh daily
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  const parsedParams = craftingParamsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return jsonError(
      formatValidationError(String(parsedParams.error)),
      400,
      undefined,
      "invalid_params"
    );
  }

  const { id } = parsedParams.data;

  try {
    const data = await getCraftingForItem(id);
    const validatedData = assertResponseShape(craftingDataSchema, data);

    return jsonOk(validatedData, 200, {
      "Cache-Control": "public, max-age=900, stale-while-revalidate=85500",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(message, 500);
  }
}
