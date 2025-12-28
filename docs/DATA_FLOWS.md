# Data Flows

## A) Item Browser

### Entry points
- Route: app/item-browser/page.tsx loads item summaries and the dataset version.
- Client UI: components/rp/ItemBrowserClient.tsx manages filters, pagination, and detail fetching.
- Details UI: components/rp/ItemDetailsModal.tsx and components/rp/ItemDetailsTabs.tsx render crafting, recycling, sources, and used-in tabs.

### Sequence (high level)
1. /item-browser renders ItemBrowserPage, fetching listCanonicalItems() and getDataVersion() in parallel.
2. The server page derives a dataVersion string and passes it to ItemBrowserClient.
3. ItemBrowserClient calls useAppVersion() to refresh the version from /api/version and uses it as a cache key.
4. Search, rarity filters, and pagination are computed client-side from the initial item list.
5. Selecting an item triggers four useCachedJson calls to /api/items/:id/crafting, /recycling, /sources, and /used-in with response/data schemas and modal TTLs.
6. ItemDetailsModal renders the tabbed detail panels and uses the assembled details object.
7. useRaidReminders stores saved items and notes in localStorage for the Raid Reminders drawer.

### Call graph (selected)
- ItemBrowserPage -> listCanonicalItems -> queryView -> createAnonClient
- ItemBrowserPage -> getDataVersion -> queryViewMaybeSingle -> createAnonClient
- ItemBrowserClient -> useCachedJson -> cachedFetchJson -> assertResponseShape
- /api/items/[id]/* -> itemParamsSchema.safeParse -> getCanonicalItemById + getCraftingForItem/getRecyclingForItem/getBestSourcesForItem/getUsedInForItem -> assertResponseShape -> jsonOk

### Data shapes (key types/schemas/contracts)
- View contract: VIEW_CONTRACTS.metadata (rp_view_metadata)
- Item summary type: CanonicalItemSummary
- Detail row types: CraftingComponentRow, RecyclingOutputRow, RecyclingSourceRow, UsedInRow
- API schemas: craftingDataSchema, recyclingDataSchema, sourcesDataSchema, usedInDataSchema
- API response envelope schema: apiResponseSchema

### Validation boundaries
- Route params validated by itemParamsSchema in lib/apiSchemas.ts.
- DB rows validated per contract by queryView/queryViewMaybeSingle in lib/data/db/query.ts.
- API payloads validated with assertResponseShape in lib/http.ts.
- Client caching validates response envelopes and throws on non-success.

### Caching behavior
- app/item-browser/page.tsx is force-dynamic with revalidate = 0.
- Item detail APIs set revalidate = 86400 and return Cache-Control headers (max-age=900, stale-while-revalidate=85500).
- Client caching uses CACHE.MODAL_TTL_MS and versioned localStorage keys in cachedFetchJson.
- Long term caching is controlled by rp_long_cache_enabled and switches TTL to CACHE.LONG_TTL_MS (Infinity).
- PWA runtime caching uses a NetworkFirst handler for https requests with an offline fallback document.

### Implementation notes
- The ItemPicker dropdown computes a responsive max height based on available viewport space and exposes a CSS variable (--picker-list-max-height) for the scrollable list.

---

## B) Repair Calculator

### Entry points
- Route: app/repair-calculator/page.tsx loads repairable items and renders RepairCalculatorClient.
- Client UI: components/rp/RepairCalculatorClient.tsx drives item selection, slider state, and cost tables.

### Sequence (high level)
1. /repair-calculator renders RepairCalculatorPage and calls listRepairableItems().
2. The page renders RepairCalculatorClient with the aggregated repairable items.
3. The client sorts items, selects a default, and tracks current durability.
4. computeRepairSummary derives cycles, missing durability, and totals based on the selected profile and recipe.
5. Cost tables are derived for per-cycle components, crafting inputs, recycling outputs, and net crafting totals.

### Call graph (selected)
- RepairCalculatorPage -> listRepairableItems -> queryView -> createAnonClient
- RepairCalculatorClient -> computeRepairSummary -> computeRepairCycles + computeRepairCost

### Data shapes (key types/contracts)
- RepairableItem
- RepairProfile, RepairRecipeRow, RepairRecipeWithComponent
- View contracts: repairProfiles, repairRecipes, legacyRepairProfiles

### Validation boundaries
- DB rows validated per contract in queryView/queryViewMaybeSingle.
- Repair calculator state is derived from loaded data and local component state.

### Caching behavior
- app/repair-calculator/page.tsx is force-dynamic with revalidate = 0.
- No client-side API fetches are used in this flow.

### Implementation notes
- RepairCalculatorClient derives repair steps from the selected repair profile (step_durability).
- RangeSlider defaults to touch-none but supports a scroll-friendly pan-y mode; the Repair Calculator opts into pan-y to allow vertical scrolling during slider interaction.

---

## C) Dataset Version

### Entry points
- API route: GET /api/version in app/api/version/route.ts
- Server usage: getDataVersion() in app/item-browser/page.tsx
- Client usage: useAppVersion() -> getAppDataVersion() -> /api/version

### Sequence (high level)
1. /api/version calls getDataVersion().
2. getDataVersion reads VIEW_CONTRACTS.datasetVersion via queryViewMaybeSingle and falls back to the first row if needed.
3. The API validates the payload with versionPayloadSchema and returns jsonOk.
4. The client fetches /api/version using cachedFetchJson and validates with versionResponseSchema.

### Caching behavior
- API response caching: revalidate = 3600 and Cache-Control max-age=300, stale-while-revalidate=3300.
- Client caching: memoized in-memory for 60 seconds and cached in localStorage with VERSION_TTL_MS.
