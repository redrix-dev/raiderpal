export {
  // Items
  getCanonicalItemById,
  listCanonicalItems,
  searchCanonicalItems,
  getCraftingForItem,
  getRecyclingForItem,
  getBestSourcesForItem,
  getUsedInForItem,
  getItemsByIds,
  getRecyclingIdSets,
} from "./items.repo";

export {
  // Repairs
  listRepairableItems,
  getRepairProfile,
  getRepairRecipeWithComponents,
  getRepairRecipeRows,
  listRepairProfilesMissingRecipes,
  repairSanityCheck,
  listItemsUsingComponent,
} from "./repairs.repo";

export {
  // Version/metadata
  getDataVersion,
} from "./meta.repo";

export type {
  CanonicalItem,
  CanonicalItemSummary,
  CraftingComponentRow,
  RecyclingOutputRow,
  RepairRecipeRow,
  RepairRecipeWithComponent,
  RepairProfile,
  UsedInRow,
  RepairSanityCheck,
} from "./db/types";

export type { RepairableItem } from "./repairs.repo";

// Internal helpers
export { VIEW_CONTRACTS } from "./db/contracts";
export { queryView, queryViewMaybeSingle } from "./db/query";
