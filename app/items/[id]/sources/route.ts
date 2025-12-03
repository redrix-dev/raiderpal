// app/items/[id]/sources/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getBestSourcesForItem } from "@/data/yields";

export async function GET(_req: NextRequest, context: any) {
  const sources = await getBestSourcesForItem(context?.params?.id);
  return NextResponse.json(sources ?? []);
}
