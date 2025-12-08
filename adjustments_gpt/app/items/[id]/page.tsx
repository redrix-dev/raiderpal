// app/items/[id]/page.tsx

import { notFound } from "next/navigation";
import { getItemById } from "@/data/items";
import { getCraftingForItem } from "@/data/crafting";
import { getRecyclingForItem } from "@/data/recycling";
import { getUsedInForItem } from "@/data/usedIn";
import { getBestSourcesForItem } from "@/data/yields";
import { RarityBadge } from "@/components/ItemCard";
import { ItemDetailsTabs } from "@/components/ItemDetailsTabs";

type ItemPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;

  const [item, crafting, recycling, usedIn, bestSources] = await Promise.all([
    getItemById(id),
    getCraftingForItem(id),
    getRecyclingForItem(id),
    getUsedInForItem(id),
    getBestSourcesForItem(id),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div className="text-warm">
      <div className="rounded-lg border border-slate-800 bg-panel-texture p-4 lg:p-5 space-y-5">
        {/* Top section: icon, name, rarity, description, stats */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-5 items-start">
          {/* Left: icon + name + description */}
          <div className="h-full rounded-lg border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center gap-4">
              {item.icon && (
                <img
                  src={item.icon}
                  alt={item.name ?? "Item image"}
                  className="w-16 h-16 rounded border border-slate-700 bg-slate-950 object-contain"
                />
              )}

              <div>
                <h1 className="text-2xl font-bold tracking-wide uppercase font-condensed">
                  {item.name}
                </h1>
                <div className="mt-1 flex items-center gap-2 text-xs text-warm-muted font-medium">
                  <RarityBadge rarity={item.rarity} />
                  {item.item_type && <span>{item.item_type}</span>}
                </div>
              </div>
            </div>

            {item.description && (
              <p className="text-sm text-warm max-w-2xl">
                {item.description}
              </p>
            )}
          </div>

          {/* Right: compact stats panel */}
          <div className="h-full w-full rounded-lg border border-slate-800 bg-slate-900/80 p-4 text-sm text-warm">
            <h2 className="text-xs font-condensed font-semibold text-warm mb-2 uppercase tracking-wide">
              Stats
            </h2>
            <dl className="space-y-1.5 text-xs">
              {item.value != null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-warm-muted font-medium">Value</dt>
                  <dd className="font-medium text-warm">{item.value}</dd>
                </div>
              )}
              {item.item_type && (
                <div className="flex justify-between gap-3">
                  <dt className="text-warm-muted font-medium">Type</dt>
                  <dd className="font-medium text-warm">
                    {item.item_type}
                  </dd>
                </div>
              )}
              {item.workbench && (
                <div className="flex justify-between gap-3">
                  <dt className="text-warm-muted font-medium">Workbench</dt>
                  <dd className="font-medium text-warm">
                    {item.workbench}
                  </dd>
                </div>
              )}
              {item.loot_area && (
                <div className="flex justify-between gap-3">
                  <dt className="text-warm-muted font-medium">Loot Area</dt>
                  <dd className="font-medium text-warm">
                    {item.loot_area}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Bottom: tabbed details */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <ItemDetailsTabs
            crafting={crafting ?? []}
            recycling={recycling ?? []}
            bestSources={bestSources ?? []}
            usedIn={usedIn ?? []}
          />
        </div>
      </div>
    </div>
  );
}
