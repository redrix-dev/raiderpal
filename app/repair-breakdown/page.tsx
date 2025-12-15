import { getRepairEconomy } from "@/data/repairEconomy";
import { getDataVersion } from "@/data/version";
import { RepairBreakdownClient } from "@/components/RepairBreakdownClient";
import { ToolPanel } from "@/components/ToolPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RepairBreakdownPage() {
  const [items, versionRow] = await Promise.all([
    getRepairEconomy(),
    getDataVersion(),
  ]);

  const dataVersion =
    versionRow?.version != null ? String(versionRow.version) : undefined;

  return (
    <ToolPanel>
      {items.length === 0 ? (
        <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-100">
          No repair data found yet. Add items to the economy view to use this calculator.
        </div>
      ) : (
        <RepairBreakdownClient items={items} dataVersion={dataVersion} />
      )}
    </ToolPanel>
  );
}
