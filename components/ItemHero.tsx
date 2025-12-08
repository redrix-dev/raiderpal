// components/ItemHero.tsx
import { RarityBadge } from "@/components/ItemCard";

type ItemHeroProps = {
  icon?: string | null;
  name?: string | null;
  description?: string | null;
  itemType?: string | null;
  rarity?: string | null;
};

export function ItemHero({
  icon,
  name,
  description,
  itemType,
  rarity,
}: ItemHeroProps) {
  return (
    <div className="h-full w-full rounded-xl border border-white/5 bg-panel-texture shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden text-warm">
      <div className="px-5 py-5 space-y-3">
        <div className="flex items-center gap-6 rounded-lg border border-white/5 bg-black/25 px-5 py-4">
          {icon && (
            <img
              src={icon}
              alt={name ?? "Item image"}
              className="w-24 h-24 rounded border border-white/10 bg-black/60 object-contain"
            />
          )}

          <div>
            <h1 className="text-4xl font-bold tracking-wide uppercase font-condensed leading-tight">
              {name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-warm-muted font-medium">
              <RarityBadge rarity={rarity} />
              {itemType && <span>{itemType}</span>}
            </div>
          </div>
        </div>

        {description && (
          <div className="rounded-lg border border-white/5 bg-black/25 px-5 py-4">
            <p className="text-lg text-warm max-w-4xl leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
