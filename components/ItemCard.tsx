// components/ItemCard.tsx
import Link from "next/link";

export type ItemCardProps = {
  item: {
    id: string;
    name: string | null;
    icon?: string | null;
    rarity?: string | null;
    value?: number | null;
    item_type?: string | null;
    loot_area?: string | null;
    workbench?: string | null;
  };
  onClick?: () => void;
};

function rarityClasses(rarity?: string | null) {
  switch (rarity) {
    case "Common":
      return "border-slate-600 bg-slate-900/70";
    case "Uncommon":
      return "border-emerald-600/70 bg-emerald-950/40";
    case "Rare":
      return "border-sky-600/70 bg-sky-950/40";
    case "Epic":
      return "border-purple-600/70 bg-purple-950/40";
    case "Legendary":
      return "border-amber-500/80 bg-amber-950/40";
    default:
      return "border-slate-700 bg-slate-900/60";
  }
}

/** Reusable rarity pill so cards + modals stay consistent */
export function RarityBadge({ rarity }: { rarity?: string | null }) {
  if (!rarity) return null;

  return (
    <span
      className={`text-[10px] uppercase tracking-wide text-gray-200 border rounded px-1.5 py-0.5 bg-slate-950/70 ${rarityClasses(
        rarity
      )}`}
    >
      {rarity}
    </span>
  );
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const inner = (
    <div
      className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm hover:border-sky-500/70 hover:bg-slate-900 transition-colors ${rarityClasses(
        item.rarity
      )}`}
    >
      {/* Icon */}
      {item.icon && (
        <img
          src={item.icon}
          alt={item.name ?? "Item icon"}
          className="h-9 w-9 rounded border border-slate-700 bg-slate-900 object-contain"
        />
      )}

      {/* Main text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-gray-50">
            {item.name ?? "Unknown item"}
          </span>
          <RarityBadge rarity={item.rarity} />
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
          {item.item_type && (
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              {item.item_type}
            </span>
          )}
          {item.loot_area && (
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-sky-500/80" />
              {item.loot_area}
            </span>
          )}
          {item.workbench && (
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-amber-500/80" />
              WB: {item.workbench}
            </span>
          )}
        </div>
      </div>

      {/* Value */}
      {item.value != null && (
        <div className="ml-2 text-right text-xs text-gray-300">
          <div className="font-semibold">{item.value}</div>
          <div className="text-[10px] text-gray-500">value</div>
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-left w-full focus:outline-none"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link href={`/items/${item.id}`} className="block">
      {inner}
    </Link>
  );
}
