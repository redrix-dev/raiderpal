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
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold font-condensed uppercase tracking-wide text-primary">
          Items Browser
        </h1>
        <p className="mt-2 text-base text-primary">
          Search and filter Arc Raiders items. Click a card for full details,
          crafting, recycling, and best sources.
        </p>
      </div>

      {/* The actual browser */}
      <ItemsBrowseClient
        initialItems={items ?? []}
        dataVersion={dataVersion}
      />
    </main>
  );
}
