// app/items/browse/page.tsx
import { ItemsBrowseClient } from "@/components/ItemsBrowseClient";
import { getDataVersion, listCanonicalItems } from "@/lib/data";
import { ModulePanel } from "@/components/ModulePanel";
import { Panel } from "@/components/ui/Panel";

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
          <p className="text-base text-warm">
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
