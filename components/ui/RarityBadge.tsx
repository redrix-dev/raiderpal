// components/ui/RarityBadge.tsx
import type { HTMLAttributes } from "react";
import { rarityClasses } from "@/components/ui/rarity";
import { cn } from "@/lib/cn";

type RarityBadgeProps = {
  rarity?: string | null;
} & HTMLAttributes<HTMLSpanElement>;

export function RarityBadge({ rarity, className, ...rest }: RarityBadgeProps) {
  if (!rarity) return null;

  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium font-condensed uppercase tracking-wide",
        "bg-surface-panel/90 text-primary border border-primary/15",
        rarityClasses(rarity),
        className
      )}
    >
      {rarity}
    </span>
  );
}