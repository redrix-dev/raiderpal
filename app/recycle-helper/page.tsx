// app/tools/recycle/page.tsx  (adjust path/name to match your project)

import { getAllItems } from "@/data/items";
import { getRecyclingIdSets } from "@/data/recycling";
import { RecycleHelperClient } from "@/components/RecycleHelperClient";
import { getDataVersion } from "@/data/version";

export default async function RecyclePage() {
  const [items, { needableIds, haveableIds }, versionRow] = await Promise.all([
    getAllItems(),
    getRecyclingIdSets(),
    getDataVersion(),
  ]);

  const dataVersion =
    versionRow?.version != null ? String(versionRow.version) : undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-100">Recycle helper</h1>
      <p className="text-sm text-gray-400">
        Quickly answer two questions: what should I recycle to get a specific
        item, and what do I get from recycling something I already have.
      </p>

      <RecycleHelperClient
        initialItems={items}
        needableIds={needableIds}
        haveableIds={haveableIds}
        dataVersion={dataVersion}
      />
    </div>
  );
}
