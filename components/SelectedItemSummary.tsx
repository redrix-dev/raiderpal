"use client";

import { RarityBadge } from "@/components/ItemCard";

type SelectedItemSummaryProps = {
  name: string | null;
  icon?: string | null;
  rarity?: string | null;
  itemType?: string | null;
  maxDurability?: number | null; // optional, for tools that care
  className?: string;
};

export function SelectedItemSummary({
  name,
  icon,
  rarity,
  itemType,
  maxDurability,
  className,
}: SelectedItemSummaryProps) {
  // If absolutely nothing, don't render
  if (!name && !icon) return null;

  return (
    <div
      className={
        "rounded-md border border-slate-800 bg-slate-900/80 p-3 text-sm flex items-center gap-3 " +
        (className ?? "")
      }
    >
      {icon && (
        <img
          src={icon}
          alt={name ?? ""}
          className="h-10 w-10 rounded border border-slate-700 bg-slate-950 object-contain"
        />
      )}
      <div className="min-w-0">
        <div className="font-medium text-warm truncate">
          {name ?? "Unnamed item"}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-warm-muted">
          {itemType && <span className="rp-pill">{itemType}</span>}
          <RarityBadge rarity={rarity ?? undefined} />
          {typeof maxDurability === "number" && (
            <span className="rp-pill">Max durability: {maxDurability}</span>
          )}
        </div>
      </div>
    </div>
  );
}
