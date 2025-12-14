// app/tools/recycle/page.tsx  (adjust path/name to match your project)

import { getAllItems } from "@/data/items";
import { getRecyclingIdSets } from "@/data/recycling";
import { RecycleHelperClient } from "@/components/RecycleHelperClient";
import { getDataVersion } from "@/data/version";
import { ToolPanel } from "@/components/ToolPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RecyclePage() {
  const [items, { needableIds, haveableIds }, versionRow] = await Promise.all([
    getAllItems(),
    getRecyclingIdSets(),
    getDataVersion(),
  ]);

  const dataVersion =
    versionRow?.version != null ? String(versionRow.version) : undefined;

  return (
    <ToolPanel>
      <RecycleHelperClient
        initialItems={items}
        needableIds={needableIds}
        haveableIds={haveableIds}
        dataVersion={dataVersion}
      />
    </ToolPanel>
  );
}
