import { listRepairableItems } from "@/lib/data";
import { ToolPanel } from "@/components/ui/ToolPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { default as dynamicImport } from "next/dynamic";

const RepairCalculatorClient = dynamicImport(
  () =>
    import("@/components/rp/RepairCalculatorClient").then(
      (mod) => mod.RepairCalculatorClient
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

export default async function RepairCalculatorPage() {
  const items = await listRepairableItems();
  const recipeCount = items.reduce((sum, item) => sum + item.recipe.length, 0);

  return (
    <ToolPanel density="compact" width="wide">
      <div className="space-y-0">
        <SectionHeader accent>
          <h1 className="text-3xl font-bold font-condensed uppercase tracking-wide text-primary-invert">
            Repair or Replace Calculator
          </h1>
        </SectionHeader>

        <Card className="rounded-t-none border-t-0 border-border-strong !p-0">
          <div className="px-6 sm:px-7 py-5 space-y-3">
            <p className="text-sm text-primary">
              Compare manual repair costs against crafting new gear. Adjust the
              durability slider to see how many cycles you need and the total
              components required.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <div className="rounded-md border border-border-subtle bg-surface-panel px-3 py-2">
                <span>Repairable items</span>
                <span className="ml-2 font-semibold text-primary">
                  {items.length}
                </span>
              </div>
              <div className="rounded-md border border-border-subtle bg-surface-panel px-3 py-2">
                <span>Recipes loaded</span>
                <span className="ml-2 font-semibold text-primary">
                  {recipeCount}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {items.length === 0 ? (
        <Card>
          <div className="text-sm font-medium text-primary">
            No repair data found yet
          </div>
          <p className="mt-1 text-xs text-muted">
            Add items to the economy view to use this calculator.
          </p>
        </Card>
      ) : (
        <RepairCalculatorClient items={items} />
      )}
    </ToolPanel>
  );
}
