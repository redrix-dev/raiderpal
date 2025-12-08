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
      <div className="rounded-lg border border-slate-800 bg-panel-texture p-4 space-y-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-wide uppercase font-condensed text-warm">
            Recycle helper
          </h1>
          <p className="text-sm text-warm-muted">
            Quickly answer two questions: what should I recycle to get a specific
            item, and what do I get from recycling something I already have.
          </p>
        </div>

        <RecycleHelperClient
          initialItems={items}
          needableIds={needableIds}
          haveableIds={haveableIds}
          dataVersion={dataVersion}
        />
      </div>
    </div>
  );
}
