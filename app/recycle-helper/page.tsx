// app/tools/recycle/page.tsx  (adjust path/name to match your project)

import { getDataVersion, getRecyclingIdSets, listCanonicalItems } from "@/lib/data";
import { ToolPanel } from "@/components/ToolPanel";
import { default as dynamicImport } from "next/dynamic";

const RecycleHelperClient = dynamicImport(
  () => import("@/components/RecycleHelperClient").then((mod) => mod.RecycleHelperClient),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="h-24 rounded-lg border border-white/5 bg-black/20" />
        <div className="h-24 rounded-lg border border-white/5 bg-black/20" />
        <div className="h-48 rounded-lg border border-white/5 bg-black/20" />
      </div>
    ),
  }
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
