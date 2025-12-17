export const VIEW_CONTRACTS = {
  metadata: { relation: "rp_view_metadata" },
  crafting: { relation: "rp_view_crafting_normalized" },
  recycling: { relation: "rp_view_recycling_outputs" },
  repairProfiles: { relation: "rp_repair_profiles" },
  repairRecipes: { relation: "rp_repair_recipes" },
} as const;

export type ViewContractKey = keyof typeof VIEW_CONTRACTS;
