const rarityClassMap: Record<string, string> = {
  Common: "border-rarity-common/100 bg-rarity-common/30",
  Uncommon: "border-rarity-uncommon/100 bg-rarity-uncommon/30",
  Rare: "border-rarity-rare/100 bg-rarity-rare/30",
  Epic: "border-rarity-epic/100 bg-rarity-epic/30",
  Legendary: "border-rarity-legendary/100 bg-rarity-legendary/30",
};

export function rarityClasses(rarity?: string | null) {
  if (!rarity) return "border-border-subtle bg-surface-card/60";
  return rarityClassMap[rarity] ?? "border-border-subtle bg-surface-card/60";
}
