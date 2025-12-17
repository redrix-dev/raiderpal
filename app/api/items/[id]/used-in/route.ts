import type { NextRequest } from "next/server";
import { itemParamsSchema, usedInDataSchema } from "@/lib/apiSchemas";
import { REVALIDATE } from "@/lib/constants";
import { getUsedInForItem } from "@/lib/data";
import {
  assertResponseShape,
  formatValidationError,
  jsonError,
  jsonOk,
  jsonErrorFromException,
  type RouteContext,
} from "@/lib/http";

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
    const data = await getUsedInForItem(id);
    const validated = assertResponseShape(usedInDataSchema, data);

    return jsonOk(validated, 200, {
      "Cache-Control": "public, max-age=900, stale-while-revalidate=85500",
    });
  } catch (err) {
    return jsonErrorFromException(err);
  }
}
