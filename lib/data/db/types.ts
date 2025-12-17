export type CanonicalItem = {
  id: string;
  name: string | null;
  description: string | null;
  item_type: string | null;
  rarity: string | null;
  icon: string | null;
  value: number | null;
  workbench: string | null;
  loot_area: string | null;
};

export type CanonicalItemSummary = Pick<
  CanonicalItem,
  "id" | "name" | "rarity" | "icon" | "item_type" | "value" | "loot_area"
> & { description: string | null; workbench: string | null };

export type RepairProfile = {
  item_id: string;
  max_durability: number;
  step_durability: number;
  notes: string | null;
};

export type RepairRecipeRow = {
  item_id: string;
  component_id: string;
  quantity_per_cycle: number;
};

export type RepairRecipeWithComponent = RepairRecipeRow & {
  component: CanonicalItemSummary | null;
};

export type RepairableItem = {
  item: CanonicalItemSummary;
  profile: RepairProfile;
  recipe: RepairRecipeWithComponent[];
};

export type CraftingComponentRow = {
  item_id: string;
  component_id: string;
  quantity: number;
  component: CanonicalItemSummary | null;
};

export type RecyclingOutputRow = {
  component_id: string;
  quantity: number;
  item_id: string;
  component: CanonicalItemSummary | null;
};

export type RecyclingSourceRow = {
  source_item_id: string;
  component_id: string;
  quantity: number;
  source: CanonicalItemSummary | null;
};

export type UsedInRow = {
  product_item_id: string;
  quantity: number;
  product: CanonicalItemSummary | null;
};

export type RepairSanityCheck = {
  bad_component_ids: number;
  bad_qty: number;
};
