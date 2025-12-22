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
  crafting: CraftingComponentRow[];
  recycling: RecyclingOutputRow[];
  sources: RecyclingSourceRow[];
  usedIn: UsedInRow[];
  loading?: {
    crafting: boolean;
    recycling: boolean;
    sources: boolean;
    usedIn: boolean;
  };
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
  sources,
  usedIn,
  loading,
}: ItemDetailsTabsProps) {
  const [active, setActive] = useState<TabId>("crafting");
  const isLoading = loading?.[active] ?? false;

  return (
    <div>
      <div className="border-b border-border-subtle">
        <div className="flex flex-wrap gap-2 px-4 pt-4 pb-3 text-sm">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`px-3.5 py-2 rounded-md border text-xs font-semibold font-condensed uppercase tracking-wide transition ${
                  isActive
                    ? "border-brand-cyan text-brand-cyan"
                    : "border-transparent text-muted hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4 text-sm text-primary">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`details-loading-${index}`}
                className="h-10 rounded-md border border-border-subtle bg-surface-card"
              />
            ))}
          </div>
        ) : (
          <>
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
                rows={sources}
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
          </>
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
    return <p className="text-sm text-muted leading-relaxed">{emptyText}</p>;
  }

  return (
    <ul className="space-y-2">
      {rows.map((raw, idx) => {
        const row = mapRow(raw);
        return (
          <li
            key={`${row.key}-${idx}`}
            className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-card px-4 py-3 text-sm"
          >
            <a
              href={row.href}
              className="flex items-center gap-3 min-w-0 text-primary hover:underline"
            >
              {row.icon && (
                <Image
                  src={row.icon}
                  alt={row.name}
                  width={36}
                  height={36}
                  sizes="36px"
                  loading="lazy"
                  className="h-9 w-9 rounded border border-border-subtle bg-surface-panel object-contain flex-shrink-0"
                />
              )}
              <span className="truncate font-medium">{row.name}</span>
            </a>

            <div className="flex-shrink-0 text-right text-primary">
              {row.quantity != null && (
                <span className="font-semibold">x{row.quantity}</span>
              )}
              {row.quantitySuffix && (
                <span className="block text-[11px] text-muted">
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
