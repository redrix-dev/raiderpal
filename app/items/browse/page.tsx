// app/items/browse/page.tsx
import { getAllItems } from "@/data/items";
import { ItemsBrowseClient } from "@/components/ItemsBrowseClient";
import { getDataVersion } from "@/data/version";

export default async function ItemsBrowsePage() {
  const [items, versionRow] = await Promise.all([
    getAllItems(),
    getDataVersion(),
  ]);

  const dataVersion =
    versionRow?.version != null ? String(versionRow.version) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Items Browser</h2>
        <p className="text-sm text-gray-400">
          Search and filter Arc Raiders items. Click a card for full details,
          crafting, recycling, and best sources.
        </p>
      </div>

      <ItemsBrowseClient
        initialItems={items ?? []}
        dataVersion={dataVersion}
      />
    </div>
  );
}
