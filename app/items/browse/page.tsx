// app/items/browse/page.tsx
import { getDataVersion, listCanonicalItems } from "@/lib/data";
import { ModulePanel } from "@/components/ModulePanel";
import { Panel } from "@/components/ui/Panel";
import { default as dynamicImport } from "next/dynamic";

const ItemsBrowseClient = dynamicImport(
  () => import("@/components/ItemsBrowseClient").then((mod) => mod.ItemsBrowseClient),
  {
    loading: () => (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="h-10 w-full rounded bg-white/5" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`browse-skeleton-${index}`}
              className="h-16 rounded-lg border border-white/5 bg-black/20"
            />
          ))}
        </div>
      </div>
    ),
  }
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ItemsBrowsePage() {
  const [items, versionRow] = await Promise.all([
    listCanonicalItems(),
    getDataVersion(),
  ]);

  const dataVersion =
    versionRow?.version != null ? String(versionRow.version) : undefined;

  return (
    <Panel className="space-y-4 min-h-[70vh] lg:min-h-[75vh] xl:min-h-[79vh]">
      <ModulePanel title="Items Browser">
        <div className="space-y-3">
          <p className="text-base text-text-primary">
            Search and filter Arc Raiders items. Click a card for full details,
            crafting, recycling, and best sources.
          </p>
          <ItemsBrowseClient
            initialItems={items ?? []}
            dataVersion={dataVersion}
          />
        </div>
      </ModulePanel>
    </Panel>
  );
}
