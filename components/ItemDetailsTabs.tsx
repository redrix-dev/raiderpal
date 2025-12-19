// components/ItemDetailsTabs.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import type {
  CraftingComponentRow,
  RecyclingOutputRow,
  RecyclingSourceRow,
  UsedInRow,
} from "@/lib/data/client";

type ItemDetailsTabsProps = {
  crafting: CraftingComponentRow[]; // rows from getCraftingForItem
  recycling: RecyclingOutputRow[]; // rows from getRecyclingForItem
  bestSources: RecyclingSourceRow[]; // rows from getBestSourcesForItem
  usedIn: UsedInRow[]; // rows from getUsedInForItem
};

type TabId = "crafting" | "recycling" | "sources" | "usedIn";

const TABS: { id: TabId; label: string }[] = [
  { id: "crafting", label: "Crafting" },
  { id: "recycling", label: "Recycles Into" },
  { id: "sources", label: "Best Sources" },
  { id: "usedIn", label: "Used In" },
];

export function ItemDetailsTabs({
  crafting,
  recycling,
  bestSources,
  usedIn,
}: ItemDetailsTabsProps) {
  const [active, setActive] = useState<TabId>("crafting");

  return (
    <div className="h-full w-full rounded-xl border border-white/5 bg-panel-texture shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Tabs header */}
      <div className="border-b border-white/5 bg-black/20 overflow-x-auto">
        <div className="flex gap-2 px-5 pt-4 pb-3 text-sm whitespace-nowrap">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={
                  "px-3.5 py-2 rounded-md border text-sm font-medium font-condensed tracking-wide uppercase " +
                  (isActive
                    ? "border-[#4fc1e9] bg-[#4fc1e9]/15 text-warm"
                    : "border-transparent bg-transparent text-warm-muted hover:bg-black/30 hover:text-warm")
              }
            >
              {tab.label}
            </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-5 py-5 text-base text-warm">
        {active === "crafting" && (
          <TabList
            emptyText="No crafting recipe."
            rows={crafting.filter(
              (c) => (c.component?.item_type ?? "").toLowerCase() !== "blueprint"
            )}
            mapRow={(c) => ({
              key: c.component_id ?? "unknown",
              href: `/items/${c.component_id}`,
              name: c.component?.name ?? "Unknown component",
              icon: c.component?.icon,
              quantity: c.quantity ?? undefined,
            })}
          />
        )}

        {active === "recycling" && (
          <TabList
            emptyText="No recycling outputs."
            rows={recycling}
            mapRow={(r) => ({
              key: r.component_id ?? "unknown",
              href: `/items/${r.component_id}`,
              name: r.component?.name ?? "Unknown component",
              icon: r.component?.icon,
              quantity: r.quantity ?? undefined,
            })}
          />
        )}

        {active === "sources" && (
          <TabList
            emptyText="No direct recycle sources."
            rows={bestSources}
            mapRow={(s) => ({
              key: s.source_item_id ?? "source",
              href: `/items/${s.source_item_id}`,
              name: s.source?.name ?? "Unknown source",
              icon: s.source?.icon,
              quantity: s.quantity,
              quantitySuffix: "per recycle",
            })}
          />
        )}

        {active === "usedIn" && (
          <TabList
            emptyText="Not used in any recipes."
            rows={usedIn}
            mapRow={(u) => ({
              key: u.product_item_id ?? "unknown",
              href: `/items/${u.product_item_id}`,
              name: u.product?.name ?? "Unknown item",
              icon: u.product?.icon,
              quantity: u.quantity ?? undefined,
            })}
          />
        )}
      </div>
    </div>
  );
}

type TabListRow = {
  key: string;
  href: string;
  name: string;
  icon?: string | null;
  quantity?: number;
  quantitySuffix?: string;
};

type TabListProps<TRow> = {
  rows: TRow[];
  emptyText: string;
  mapRow: (row: TRow) => TabListRow;
};

function TabList<TRow>({ rows, emptyText, mapRow }: TabListProps<TRow>) {
  if (!rows || rows.length === 0) {
    return (
      <p className="text-sm text-warm-muted leading-relaxed">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((raw, idx) => {
        const row = mapRow(raw);
        return (
          <li
            key={`${row.key}-${idx}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/30 px-5 py-3 text-base font-semibold"
          >
            <a
              href={row.href}
              className="flex items-center gap-3 min-w-0 text-warm hover:underline"
            >
              {row.icon && (
                <Image
                  src={row.icon}
                  alt={row.name}
                  width={40}
                  height={40}
                  sizes="40px"
                  loading="lazy"
                  className="h-10 w-10 rounded border border-white/10 bg-black/60 object-contain flex-shrink-0"
                />
              )}
              <span className="truncate">{row.name}</span>
            </a>

            <div className="flex-shrink-0 text-right text-warm">
              {row.quantity != null && (
                <span className="font-semibold">×{row.quantity}</span>
              )}
              {row.quantitySuffix && (
                <span className="block text-[11px] text-warm-muted">
                  {row.quantitySuffix}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
