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
  params: { id: string };
};

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = params;

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
    <div className="text-gray-100 space-y-6">
      {/* Top section: icon, name, rarity, description, stats */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
        {/* Left: icon + name + description */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-4">
            {item.icon && (
              <img
                src={item.icon}
                alt={item.name ?? "Item image"}
                className="w-16 h-16 rounded border border-gray-700 bg-slate-950 object-contain"
              />
            )}

            <div>
              <h1 className="text-2xl font-semibold">{item.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                <RarityBadge rarity={item.rarity} />
                {item.item_type && <span>{item.item_type}</span>}
              </div>
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-gray-300 max-w-2xl">
              {item.description}
            </p>
          )}
        </div>

        {/* Right: compact stats panel */}
        <div className="w-full max-w-xs rounded-lg border border-slate-800 bg-slate-950/90 p-3 text-sm text-gray-200">
          <h2 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            Stats
          </h2>
          <dl className="space-y-1.5 text-xs">
            {item.value != null && (
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">Value</dt>
                <dd className="font-medium text-gray-100">{item.value}</dd>
              </div>
            )}
            {item.item_type && (
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">Type</dt>
                <dd className="font-medium text-gray-100">
                  {item.item_type}
                </dd>
              </div>
            )}
            {item.workbench && (
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">Workbench</dt>
                <dd className="font-medium text-gray-100">
                  {item.workbench}
                </dd>
              </div>
            )}
            {item.loot_area && (
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">Loot Area</dt>
                <dd className="font-medium text-gray-100">
                  {item.loot_area}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Bottom: tabbed details */}
      <ItemDetailsTabs
        crafting={crafting ?? []}
        recycling={recycling ?? []}
        bestSources={bestSources ?? []}
        usedIn={usedIn ?? []}
      />
    </div>
  );
}
