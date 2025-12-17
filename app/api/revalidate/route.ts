import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { REVALIDATE } from "@/lib/constants";
import { jsonError, jsonOk } from "@/lib/http";

const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN;
const REVALIDATE_NEVER = REVALIDATE.NEVER;

export const revalidate = REVALIDATE_NEVER;
export const runtime = "nodejs";

type RevalidatePayload = {
  tags?: unknown;
  paths?: unknown;
};

export async function POST(req: NextRequest) {
  if (!REVALIDATE_TOKEN) {
    return jsonError("config_error", "Revalidation token not configured", 500);
  }

  const token = req.headers.get("x-revalidate-token");

  if (token !== REVALIDATE_TOKEN) {
    return jsonError("unauthorized", "Unauthorized", 401);
  }

  let body: RevalidatePayload = {};

  try {
    body = (await req.json()) as RevalidatePayload;
  } catch (_err) {
    // fall through with empty body
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];

  const paths = Array.isArray(body.paths)
    ? body.paths.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];

  if (tags.length === 0 && paths.length === 0) {
    return jsonError(
      "invalid_request",
      "No tags or paths provided for revalidation",
      400
    );
  }

  tags.forEach((tag) => revalidateTag(tag));
  paths.forEach((path) => revalidatePath(path));

  return jsonOk({ revalidated: { tags, paths } }, 200, {
    "Cache-Control": "no-store",
  });
}
