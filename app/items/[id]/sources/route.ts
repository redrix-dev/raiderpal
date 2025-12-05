// app/items/[id]/sources/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getBestSourcesForItem } from "@/data/yields";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const sources = await getBestSourcesForItem(id);
  return NextResponse.json(sources ?? []);
}
