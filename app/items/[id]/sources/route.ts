// app/items/[id]/sources/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getBestSourcesForItem } from "@/data/yields";

type RouteContext = {
  params: { id: string };
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const sources = await getBestSourcesForItem(params.id);
  return NextResponse.json(sources ?? []);
}
