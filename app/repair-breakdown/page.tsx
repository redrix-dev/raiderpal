import { listRepairableItems } from "@/lib/data";
import { ToolPanel } from "@/components/ToolPanel";
import { default as dynamicImport } from "next/dynamic";

const RepairBreakdownClient = dynamicImport(
  () =>
    import("@/components/RepairBreakdownClient").then(
      (mod) => mod.RepairBreakdownClient
    ),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="h-28 rounded-lg border border-white/5 bg-black/20" />
        <div className="h-52 rounded-lg border border-white/5 bg-black/20" />
      </div>
    ),
  }
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RepairBreakdownPage() {
  const items = await listRepairableItems();

  return (
    <ToolPanel>
      {items.length === 0 ? (
        <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-100">
          No repair data found yet. Add items to the economy view to use this calculator.
        </div>
      ) : (
        <RepairBreakdownClient items={items} />
      )}
    </ToolPanel>
  );
}
