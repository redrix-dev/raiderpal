import { REVALIDATE } from "@/lib/constants";
import { listRepairableItems } from "@/lib/data";
import { RepairCalculatorClient } from "@/components/RepairCalculatorClient";
import { ToolPanel } from "@/components/ToolPanel";

export const dynamic = "force-dynamic";
const REVALIDATE_NEVER = REVALIDATE.NEVER;

export const revalidate = REVALIDATE_NEVER;

export default async function RepairCalculatorPage() {
  const items = await listRepairableItems();

  return (
    <ToolPanel>
      {items.length === 0 ? (
        <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-100">
          No repair data found yet. Add items to the economy view to use this calculator.
        </div>
      ) : (
        <RepairCalculatorClient items={items} />
      )}
    </ToolPanel>
  );
}
