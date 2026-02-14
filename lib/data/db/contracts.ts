import { z, type Infer, type Schema } from "@/lib/validation";

export type ViewContract<T> = {
  relation: string;
  select: string;
  schema: Schema<T>;
};

export const VIEW_CONTRACTS = {
  metadata: {
    relation: "rp_view_metadata",
    select:
      "id, name, description, item_type, rarity, icon, value, workbench, loot_area",
    schema: z.object({
      id: z.string(),
      name: z.string().nullable(),
      description: z.string().nullable(),
      item_type: z.string().nullable(),
      rarity: z.string().nullable(),
      icon: z.string().nullable(),
      value: z.number().nullable(),
      workbench: z.string().nullable(),
      loot_area: z.string().nullable(),
    }),
  },
  crafting: {
    relation: "rp_view_crafting_normalized",
    select: "item_id, component_id, total_quantity",
    schema: z.object({
      item_id: z.string(),
      component_id: z.string(),
      total_quantity: z.number(),
    }),
  },
  recycling: {
    relation: "rp_view_recycle_outputs",
    select: "item_id, component_id, quantity",
    schema: z.object({
      item_id: z.string(),
      component_id: z.string(),
      quantity: z.number(),
    }),
  },
  repairRecipes: {
    relation: "rp_view_repair_recipes",
    select: "item_id, component_id, quantity_per_cycle",
    schema: z.object({
      item_id: z.string(),
      component_id: z.string(),
      quantity_per_cycle: z.number(),
    }),
  },
  repairProfiles: {
    relation: "rp_view_repair_profiles",
    select: "item_id, max_durability, step_durability, notes",
    schema: z.object({
      item_id: z.string(),
      max_durability: z.number(),
      step_durability: z.number(),
      notes: z.string().nullable(),
    }),
  },
  //legacyRepairProfiles: {
    //relation: "rp_repair_profiles",
   // select: "item_id, max_durability, step_durability, notes",
    //schema: z.object({
      //item_id: z.string(),
      //max_durability: z.number(),
      //step_durability: z.number(),
      //notes: z.string().nullable(),
    //}),
  //},
  datasetVersion: {
    relation: "rp_dataset_version",
    select: "id, version, last_synced_at",
    schema: z.object({
      id: z.string(),
      version: z.number(),
      last_synced_at: z.string().nullable(),
    }),
  },
} as const satisfies Record<string, ViewContract<unknown>>;

export type ViewContractName = keyof typeof VIEW_CONTRACTS;

export type MetadataRow = Infer<typeof VIEW_CONTRACTS.metadata.schema>;
export type CraftingRow = Infer<typeof VIEW_CONTRACTS.crafting.schema>;
export type RecyclingRow = Infer<typeof VIEW_CONTRACTS.recycling.schema>;
export type RepairRecipeRow = Infer<typeof VIEW_CONTRACTS.repairRecipes.schema>;
export type RepairProfileRow = Infer<typeof VIEW_CONTRACTS.repairProfiles.schema>;
export type DatasetVersionRow = Infer<typeof VIEW_CONTRACTS.datasetVersion.schema>;
