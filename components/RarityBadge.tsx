import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type RarityBadgeProps = {
  rarity?: string | null;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>;

const rarityClasses: Record<string, string> = {
  Common: "border-rarity-common/80 bg-rarity-common/30",
  Uncommon: "border-rarity-uncommon/80 bg-rarity-uncommon/30",
  Rare: "border-rarity-rare/80 bg-rarity-rare/30",
  Epic: "border-rarity-epic/80 bg-rarity-epic/30",
  Legendary: "border-rarity-legendary/80 bg-rarity-legendary/30",
};

export function RarityBadge({ rarity, className, ...rest }: RarityBadgeProps) {
  if (!rarity) return null;

  return (
    <span
      {...rest}
      className={cn(
        "rp-pill font-condensed uppercase tracking-wide text-[10px]",
        rarityClasses[rarity] ?? "border-border-subtle bg-surface-panel",
        className
      )}
    >
      {rarity}
    </span>
  );
}
