export {
  // Items
  getCanonicalItemById,
  listCanonicalItems,
  searchCanonicalItems,
  getCraftingForItem,
  getRecyclingForItem,
  getBestSourcesForItem,
  getUsedInForItem,
  getRecyclingIdSets,
} from "./items.repo";

export {
  // Repairs
  listRepairableItems,
  getRepairProfile,
  getRepairRecipeWithComponents,
} from "./repairs.repo";

export {
  // Version
  getDataVersion,
} from "./version.repo";

export type {
  // Types
  CanonicalItem,
  CanonicalItemSummary,
  CraftingComponentRow,
  RecyclingOutputRow,
  RepairableItem,
} from "./db/types";

// Internal (use with caution)
export { VIEW_CONTRACTS } from "./db/contracts";
export { queryView, queryViewMaybeSingle } from "./db/query";
