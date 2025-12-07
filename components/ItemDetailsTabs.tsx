// components/ItemDetailsTabs.tsx
"use client";

import { useState } from "react";

type ItemDetailsTabsProps = {
  crafting: any[];     // rows from getCraftingForItem
  recycling: any[];    // rows from getRecyclingForItem
  bestSources: any[];  // rows from getBestSourcesForItem
  usedIn: any[];       // rows from getUsedInForItem
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
    <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/80">
      {/* Tabs header */}
      <div className="border-b border-slate-800 overflow-x-auto">
        <div className="flex gap-1 px-3 pt-2 pb-1 text-xs whitespace-nowrap">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={
                  "px-3 py-1.5 rounded-md border text-xs " +
                  (isActive
                    ? "border-sky-500 bg-sky-950/70 text-sky-100"
                    : "border-transparent bg-transparent text-gray-400 hover:bg-slate-900 hover:text-gray-100")
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-3 py-3 text-sm text-gray-100">
        {active === "crafting" && (
          <TabList
            emptyText="No crafting recipe."
            rows={crafting.filter(
              (c: any) => (c.component_type ?? "").toLowerCase() !== "blueprint"
            )}
            mapRow={(c: any) => ({
              key: c.component_id ?? "unknown",
              href: `/items/${c.component_id}`,
              name: c.component_name,
              icon: c.component_icon,
              quantity: c.quantity,
            })}
          />
        )}

        {active === "recycling" && (
          <TabList
            emptyText="No recycling outputs."
            rows={recycling}
            mapRow={(r: any) => ({
              key: r.component_id,
              href: `/items/${r.component_id}`,
              name: r.component_name,
              icon: r.component_icon,
              quantity: r.quantity,
            })}
          />
        )}

        {active === "sources" && (
          <TabList
            emptyText="No direct recycle sources."
            rows={bestSources}
            mapRow={(s: any) => ({
              key: s.sourceItemId,
              href: `/items/${s.sourceItemId}`,
              name: s.sourceName,
              icon: s.sourceIcon,
              quantity: s.quantity,
              quantitySuffix: "per recycle",
            })}
          />
        )}

        {active === "usedIn" && (
          <TabList
            emptyText="Not used in any recipes."
            rows={usedIn}
            mapRow={(u: any) => ({
              key: u.product_id,
              href: `/items/${u.product_id}`,
              name: u.product_name,
              icon: u.product_icon,
              quantity: u.quantity,
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
  quantity?: number | null;
  quantitySuffix?: string;
};

type TabListProps = {
  rows: any[];
  emptyText: string;
  mapRow: (row: any) => TabListRow;
};

function TabList({ rows, emptyText, mapRow }: TabListProps) {
  if (!rows || rows.length === 0) {
    return <p className="text-xs text-gray-500">{emptyText}</p>;
  }

  return (
    <ul className="space-y-1">
      {rows.map((raw, idx) => {
        const row = mapRow(raw);
        return (
          <li
            key={`${row.key}-${idx}`}
            className="flex items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs"
          >
            <a
              href={row.href}
              className="flex items-center gap-2 min-w-0 text-gray-100 hover:underline"
            >
              {row.icon && (
                <img
                  src={row.icon}
                  alt={row.name}
                  className="h-7 w-7 rounded border border-slate-700 bg-slate-950 object-contain flex-shrink-0"
                />
              )}
              <span className="truncate">{row.name}</span>
            </a>

            <div className="flex-shrink-0 text-right text-gray-300">
              {row.quantity != null && (
                <span className="font-semibold">×{row.quantity}</span>
              )}
              {row.quantitySuffix && (
                <span className="block text-[10px] text-gray-500">
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
