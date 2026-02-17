import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Panel } from "@/components/ui/Panel";
import { ToolPanel } from "@/components/ui/ToolPanel";
import { getDataVersion, listCanonicalItems } from "@/lib/data";
import { default as dynamicImport } from "next/dynamic";

const ItemBrowserClient = dynamicImport(
  () => import("@/components/rp/ItemBrowserClient").then((mod) => mod.ItemBrowserClient),
  {
    loading: () => <ItemBrowserLoading />,
  }
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ItemBrowserPage() {
  const [items, versionRow] = await Promise.all([
    listCanonicalItems(),
    getDataVersion(),
  ]);

  const dataVersion =
    versionRow?.version != null ? String(versionRow.version) : "Unknown";

  return (
    <ToolPanel width="wide">
      <div data-testid="item-browser-page">
        <SectionHeader accent>
          <h1 className="text-3xl font-bold font-condensed uppercase tracking-wide text-primary-invert">
            Item Browser
          </h1>
        </SectionHeader>
        <Card flushTop padding="none" className="border-border-strong">
          <div className="px-6 sm:px-7 py-5 space-y-3">
            <p className="text-sm text-primary">
              Clean, token-first browsing with quick filters, rarity-aware cards,
              and inline item previews.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <div className="rounded-md border border-border-subtle bg-surface-panel px-3 py-2">
                <span>Items loaded</span>
                <span className="ml-2 font-semibold text-primary">
                  {items?.length ?? 0}
                </span>
              </div>
              <div className="rounded-md border border-border-subtle bg-surface-panel px-3 py-2">
                <span>Data version</span>
                <span className="ml-2 font-semibold text-primary">
                  {dataVersion}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <ItemBrowserClient initialItems={items ?? []} dataVersion={dataVersion} />
    </ToolPanel>
  );
}

function ItemBrowserLoading() {
  return (
    <Panel variant="light" padding="roomy">
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-44 rounded bg-surface-panel" />
        <div className="h-10 w-full rounded bg-surface-panel" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`item-browser-skeleton-${index}`}
              className="h-16 rounded-lg border border-border-subtle bg-surface-panel"
            />
          ))}
        </div>
      </div>
    </Panel>
  );
}
