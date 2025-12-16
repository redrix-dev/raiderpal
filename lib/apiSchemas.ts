import { z, type Infer, type Schema } from "@/lib/validation";

const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const apiSuccessSchema = <TSchema extends Schema<any>>(dataSchema: TSchema) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const apiResponseSchema = <TSchema extends Schema<any>>(dataSchema: TSchema) =>
  z.union([apiSuccessSchema(dataSchema), apiErrorSchema]);

export const craftingParamsSchema = z.object({
  id: z.string().trim().min(1, "Missing or invalid id"),
});

const itemSummarySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  rarity: z.string().nullable(),
  item_type: z.string().nullable(),
  icon: z.string().nullable(),
  value: z.number().nullable(),
  workbench: z.string().nullable(),
  loot_area: z.string().nullable(),
});

const craftingRecipeSchema = z.object({
  item_id: z.string(),
  component_item_id: z.string(),
  quantity: z.number(),
  component: itemSummarySchema.nullable(),
});

export const craftingDataSchema = z.array(craftingRecipeSchema);
export const craftingResponseSchema = apiResponseSchema(craftingDataSchema);

export const versionPayloadSchema = z.object({
  version: z.number(),
  last_synced_at: z.string().nullable(),
});

export const versionResponseSchema = apiResponseSchema(versionPayloadSchema);

export type CraftingParams = Infer<typeof craftingParamsSchema>;
export type CraftingRecipe = Infer<typeof craftingRecipeSchema>;
export type CraftingResponse = Infer<typeof craftingResponseSchema>;
export type VersionPayload = Infer<typeof versionPayloadSchema>;
export type VersionResponse = Infer<typeof versionResponseSchema>;
