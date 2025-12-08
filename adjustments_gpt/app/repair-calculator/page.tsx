import { getRepairEconomy } from "@/data/repairEconomy";
import { getDataVersion } from "@/data/version";
import { RepairCalculatorClient } from "@/components/RepairCalculatorClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RepairCalculatorPage() {
  const [items, versionRow] = await Promise.all([
    getRepairEconomy(),
    getDataVersion(),
  ]);

  const dataVersion =
    versionRow?.version != null ? String(versionRow.version) : undefined;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-800 bg-panel-texture p-4 space-y-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-wide uppercase font-condensed">
            Repair or Replace Calculator
          </h1>
          <p className="text-sm text-warm-muted max-w-2xl">
            Compare repair cost vs craft cost (minus recycle outputs) to choose the better move.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-100">
            No repair data found yet. Add items to the economy view to use this calculator.
          </div>
        ) : (
          <RepairCalculatorClient items={items} dataVersion={dataVersion} />
        )}
      </div>
    </div>
  );
}
