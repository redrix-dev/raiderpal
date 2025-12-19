import type { NextRequest } from "next/server";
import { repairEconomyDataSchema } from "@/lib/apiSchemas";
import { listRepairableItems } from "@/lib/data";
import { assertResponseShape, jsonErrorFromException, jsonOk } from "@/lib/http";

export const revalidate = 3600; // refresh hourly to align with data syncs
export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const data = await listRepairableItems();
    const validated = assertResponseShape(repairEconomyDataSchema, data);
    return jsonOk(validated, 200, {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3300",
    });
  } catch (err) {
    return jsonErrorFromException(err);
  }
}
