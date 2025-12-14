// app/items/[id]/page.tsx

import { notFound } from "next/navigation";
import { getItemById } from "@/data/items";
import { getCraftingForItem } from "@/data/crafting";
import { getRecyclingForItem } from "@/data/recycling";
import { getUsedInForItem } from "@/data/usedIn";
import { getBestSourcesForItem } from "@/data/yields";
import { ItemDetailsTabs } from "@/components/ItemDetailsTabs";
import { ItemHero } from "@/components/ItemHero";
import { ItemStatsPanel } from "@/components/ItemStatsPanel";

type ItemPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      <div className="rounded-xl border border-[#130918] bg-panel-texture p-3 lg:p-4 space-y-4 min-h-[70vh] lg:min-h-[75vh] xl:min-h-[79vh]">
        {/* Top section: icon, name, rarity, description, stats */}
        <div className="grid gap-5 md:grid-cols-2 md:gap-6 items-stretch">
          {/* Left: icon + name + description */}
          <div className="h-full rounded-xl border border-[#130918] bg-[#130918]/75 p-3 lg:p-4 overflow-hidden">
            <ItemHero
              icon={item.icon}
              name={item.name}
              description={item.description}
              itemType={item.item_type}
              rarity={item.rarity}
            />
          </div>

          {/* Right: compact stats panel */}
          <div className="h-full rounded-xl border border-[#130918] bg-[#130918]/75 p-3 lg:p-4 overflow-hidden">
            <ItemStatsPanel
              value={item.value}
              itemType={item.item_type}
              workbench={item.workbench}
              lootArea={item.loot_area}
            />
          </div>
        </div>

        {/* Bottom: tabbed details */}
        <div className="rounded-xl border border-[#130918] bg-[#130918]/75 p-3 lg:p-4 overflow-hidden">
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
