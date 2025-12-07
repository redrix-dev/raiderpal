// app/items/[id]/sources/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getBestSourcesForItem } from "@/data/yields";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  if (!id || typeof id !== "string" || !id.trim()) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }

  const sources = await getBestSourcesForItem(id.trim());
  return NextResponse.json(sources ?? []);
}
