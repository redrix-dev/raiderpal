/**
 * @fileoverview API route for fetching crafting recipes for items
 *
 * GET /api/items/[id]/crafting
 *
 * Returns the crafting components required to build a specific item.
 * Includes component metadata and quantities for UI display.
 */

import { craftingDataSchema, itemParamsSchema } from "@/lib/apiSchemas";
import { getCanonicalItemById, getCraftingForItem } from "@/lib/data";
import {
  assertResponseShape,
  formatValidationError,
  jsonError,
  jsonOk,
  jsonErrorFromException,
  type RouteContext,
} from "@/lib/http";
import type { NextRequest } from "next/server";

/**
 * Revalidate cached responses every 24 hours
 */
export const revalidate = 86400; // refresh daily

/**
 * Force Node.js runtime for database operations
 */
export const runtime = "nodejs";

/**
 * GET handler for item crafting data
 *
 * @param _req - The incoming request (unused)
 * @param context - Route context containing URL parameters
 * @returns JSON response with crafting data or error
 */
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
    const data = await getCraftingForItem(id);
    const validatedData = assertResponseShape(craftingDataSchema, data);

    return jsonOk(validatedData, 200, {
      "Cache-Control": "public, max-age=900, stale-while-revalidate=85500",
    });
  } catch (err) {
    return jsonErrorFromException(err);
  }
}
