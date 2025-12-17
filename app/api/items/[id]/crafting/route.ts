import { craftingDataSchema, itemParamsSchema } from "@/lib/apiSchemas";
import { REVALIDATE } from "@/lib/constants";
import { getCraftingForItem } from "@/lib/data";
import {
  assertResponseShape,
  formatValidationError,
  jsonError,
  jsonOk,
  jsonErrorFromException,
  type RouteContext,
} from "@/lib/http";
import type { NextRequest } from "next/server";

const REVALIDATE_DAILY = REVALIDATE.DAILY;

export const revalidate = REVALIDATE_DAILY; // refresh daily
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
    const data = await getCraftingForItem(id);
    const validatedData = assertResponseShape(craftingDataSchema, data);

    return jsonOk(validatedData, 200, {
      "Cache-Control": "public, max-age=900, stale-while-revalidate=85500",
    });
  } catch (err) {
    return jsonErrorFromException(err);
  }
}
