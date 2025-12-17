// app/tools/recycle/page.tsx  (adjust path/name to match your project)

import { getDataVersion, getRecyclingIdSets, listCanonicalItems } from "@/lib/data";
import { REVALIDATE } from "@/lib/constants";
import { RecycleHelperClient } from "@/components/RecycleHelperClient";
import { ToolPanel } from "@/components/ToolPanel";

const REVALIDATE_NEVER = REVALIDATE.NEVER;

export const dynamic = "force-dynamic";
export const revalidate = REVALIDATE_NEVER;

export default async function RecyclePage() {
  const [items, { needableIds, haveableIds }, versionRow] = await Promise.all([
    listCanonicalItems(),
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
