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
        "rp-pill font-condensed uppercase tracking-wide text-[10px] text-primary",
        rarityClasses(rarity),
        className
      )}
    >
      {rarity}
    </span>
  );
}
