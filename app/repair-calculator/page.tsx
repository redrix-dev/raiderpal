import { getRepairEconomy } from "@/data/repairEconomy";
import { RepairCalculatorClient } from "@/components/RepairCalculatorClient";

export default async function RepairCalculatorPage() {
  const items = await getRepairEconomy();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Repair or Replace Calculator
        </h1>
        <p className="text-sm text-gray-300 max-w-2xl">
          Compare repair cost vs craft cost (minus recycle outputs) to choose the better move.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-100">
          No repair data found yet. Add items to the economy view to use this calculator.
        </div>
      ) : (
        <RepairCalculatorClient items={items} />
      )}
    </div>
  );
}
