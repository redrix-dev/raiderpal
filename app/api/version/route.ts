import type { NextRequest } from "next/server";
import { getDataVersion } from "@/data/version";
import { versionPayloadSchema } from "@/lib/apiSchemas";
import { assertResponseShape, jsonOk, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const meta = await getDataVersion();

    if (!meta) {
      return jsonError("Data version not found", 404);
    }

    const validated = assertResponseShape(versionPayloadSchema, meta);

    return jsonOk(validated, 200, {
      "Cache-Control": "no-store",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(message, 500);
  }
}
