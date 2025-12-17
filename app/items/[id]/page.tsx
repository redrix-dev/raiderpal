// app/items/[id]/page.tsx

import { notFound } from "next/navigation";
import {
  getBestSourcesForItem,
  getCanonicalItemById,
  getCraftingForItem,
  getRecyclingForItem,
  getUsedInForItem,
} from "@/lib/data";
import { ItemDetailsTabs } from "@/components/ItemDetailsTabs";
import { ItemHero } from "@/components/ItemHero";
import { ItemStatsPanel } from "@/components/ItemStatsPanel";
import { Panel } from "@/components/ui/Panel";
import { Card } from "@/components/ui/Card";
import { REVALIDATE } from "@/lib/constants";

type ItemPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
const REVALIDATE_NEVER = REVALIDATE.NEVER;

export const revalidate = REVALIDATE_NEVER;

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;

  const [item, crafting, recycling, usedIn, bestSources] = await Promise.all([
    getCanonicalItemById(id),
    getCraftingForItem(id),
    getRecyclingForItem(id),
    getUsedInForItem(id),
    getBestSourcesForItem(id),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <Panel className="space-y-4 min-h-[70vh] lg:min-h-[75vh] xl:min-h-[79vh]">
      {/* Top section: icon, name, rarity, description, stats */}
      <div className="grid gap-5 md:grid-cols-2 md:gap-6 items-stretch">
        {/* Left: icon + name + description */}
        <Card className="h-full overflow-hidden p-3 lg:p-4">
          <ItemHero
            icon={item.icon}
            name={item.name}
            description={item.description}
            itemType={item.item_type}
            rarity={item.rarity}
          />
        </Card>

        {/* Right: compact stats panel */}
        <Card className="h-full overflow-hidden p-3 lg:p-4">
          <ItemStatsPanel
            value={item.value}
            itemType={item.item_type}
            workbench={item.workbench}
            lootArea={item.loot_area}
          />
        </Card>
      </div>

      {/* Bottom: tabbed details */}
      <Card className="overflow-hidden p-3 lg:p-4">
        <ItemDetailsTabs
          crafting={crafting ?? []}
          recycling={recycling ?? []}
          bestSources={bestSources ?? []}
          usedIn={usedIn ?? []}
        />
      </Card>
    </Panel>
  );
}
