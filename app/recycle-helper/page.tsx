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
    <div className="rounded-xl border border-[#130918] bg-panel-texture p-4 sm:p-5 space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.6)] min-h-[70vh] lg:min-h-[75vh] xl:min-h-[79vh]">
      <RecycleHelperClient
        initialItems={items}
        needableIds={needableIds}
        haveableIds={haveableIds}
        dataVersion={dataVersion}
      />
    </div>
  );
}
