// app/items/[id]/sources/route.ts
import { NextResponse } from "next/server";
import { getBestSourcesForItem } from "@/data/yields";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const sources = await getBestSourcesForItem(id);
  return NextResponse.json(sources ?? []);
}
