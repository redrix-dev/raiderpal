// app/items/[id]/sources/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getBestSourcesForItem } from "@/data/yields";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sources = await getBestSourcesForItem(params.id);
  return NextResponse.json(sources ?? []);
}
