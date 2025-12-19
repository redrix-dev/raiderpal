import type { ApiResponse, ApiSuccess } from "@/lib/http";
import type {
  CraftingComponentRow,
  RecyclingOutputRow,
  RecyclingSourceRow,
  UsedInRow,
  RepairableItem,
} from "@/lib/data/db/types";
import { z, type Infer, type Schema } from "@/lib/validation";

const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const apiSuccessSchema = <TData>(
  dataSchema: Schema<TData>
): Schema<ApiSuccess<TData>> =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const apiResponseSchema = <TData>(
  dataSchema: Schema<TData>
): Schema<ApiResponse<TData>> =>
  z.union([apiSuccessSchema(dataSchema), apiErrorSchema]);

export const itemParamsSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Missing or invalid id")
    .max(255, "ID exceeds maximum length")
    .regex(/^[a-zA-Z0-9_-]+$/, "ID contains invalid characters"),
});

export const itemSummarySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  rarity: z.string().nullable(),
  item_type: z.string().nullable(),
  icon: z.string().nullable(),
  value: z.number().nullable(),
  workbench: z.string().nullable(),
  loot_area: z.string().nullable(),
  description: z.string().nullable(),
});

const craftingRecipeSchema = z.object({
  item_id: z.string(),
  component_id: z.string(),
  quantity: z.number(),
  component: itemSummarySchema.nullable(),
});

const recyclingOutputSchema = z.object({
  item_id: z.string(),
  component_id: z.string(),
  quantity: z.number(),
  component: itemSummarySchema.nullable(),
});

const recyclingSourceSchema = z.object({
  source_item_id: z.string(),
  component_id: z.string(),
  quantity: z.number(),
  source: itemSummarySchema.nullable(),
});

const usedInSchema = z.object({
  product_item_id: z.string(),
  quantity: z.number(),
  product: itemSummarySchema.nullable(),
});

const repairProfileSchema = z.object({
  item_id: z.string(),
  max_durability: z.number(),
  step_durability: z.number(),
  notes: z.string().nullable(),
});

const repairRecipeWithComponentSchema = z.object({
  item_id: z.string(),
  component_id: z.string(),
  quantity_per_cycle: z.number(),
  component: itemSummarySchema.nullable(),
});

const repairableItemSchema = z.object({
  item: itemSummarySchema,
  profile: repairProfileSchema,
  recipe: z.array(repairRecipeWithComponentSchema),
  crafting: z.array(craftingRecipeSchema),
  recycling: z.array(recyclingOutputSchema),
});

export const craftingDataSchema: Schema<CraftingComponentRow[]> = z.array(craftingRecipeSchema);
export const recyclingDataSchema: Schema<RecyclingOutputRow[]> = z.array(recyclingOutputSchema);
export const sourcesDataSchema: Schema<RecyclingSourceRow[]> = z.array(recyclingSourceSchema);
export const usedInDataSchema: Schema<UsedInRow[]> = z.array(usedInSchema);
export const repairEconomyDataSchema: Schema<RepairableItem[]> = z.array(repairableItemSchema);

export const craftingResponseSchema: Schema<ApiResponse<CraftingComponentRow[]>> =
  apiResponseSchema(craftingDataSchema);
export const recyclingResponseSchema: Schema<ApiResponse<RecyclingOutputRow[]>> =
  apiResponseSchema(recyclingDataSchema);
export const sourcesResponseSchema: Schema<ApiResponse<RecyclingSourceRow[]>> =
  apiResponseSchema(sourcesDataSchema);
export const usedInResponseSchema: Schema<ApiResponse<UsedInRow[]>> =
  apiResponseSchema(usedInDataSchema);
export const repairEconomyResponseSchema: Schema<ApiResponse<RepairableItem[]>> =
  apiResponseSchema(repairEconomyDataSchema);

export const versionPayloadSchema = z.object({
  version: z.number(),
  last_synced_at: z.string().nullable(),
});

export const versionResponseSchema = apiResponseSchema(versionPayloadSchema);

export type ItemParams = Infer<typeof itemParamsSchema>;
export type CraftingRecipe = Infer<typeof craftingRecipeSchema>;
export type CraftingResponse = Infer<typeof craftingResponseSchema>;
export type RecyclingOutputResponse = Infer<typeof recyclingResponseSchema>;
export type SourcesResponse = Infer<typeof sourcesResponseSchema>;
export type UsedInResponse = Infer<typeof usedInResponseSchema>;
export type RepairEconomyResponse = Infer<typeof repairEconomyResponseSchema>;
export type VersionPayload = Infer<typeof versionPayloadSchema>;
export type VersionResponse = Infer<typeof versionResponseSchema>;
