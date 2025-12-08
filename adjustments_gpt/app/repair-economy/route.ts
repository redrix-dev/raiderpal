import { getRepairEconomy } from "@/data/repairEconomy";

export const revalidate = 0;

export async function GET() {
  try {
    const data = await getRepairEconomy();
    return Response.json(data);
  } catch (error: any) {
    const message = error?.message ?? "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
    });
  }
}
