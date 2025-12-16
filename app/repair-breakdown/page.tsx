import { listRepairableItems } from "@/lib/data";
import { RepairBreakdownClient } from "@/components/RepairBreakdownClient";
import { ToolPanel } from "@/components/ToolPanel";

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
