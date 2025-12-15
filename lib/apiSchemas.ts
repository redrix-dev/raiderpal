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

const craftingRecipeSchema = z.object({
  item_id: z.string().nullable(),
  quantity: z.number().nullable(),
  component_id: z.string().nullable(),
  component_name: z.string().nullable(),
  component_icon: z.string().nullable(),
  component_rarity: z.string().nullable(),
  component_type: z.string().nullable(),
  component_value: z.number().nullable(),
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
