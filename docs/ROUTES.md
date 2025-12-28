# Routes

## Pages (App Router)

### /
Entry: app/page.tsx
Home page with ModulePanel tiles linking to the Item Browser and Repair Calculator, plus an About panel.

### /item-browser
Entry: app/item-browser/page.tsx
Server-renders the item browser page by loading canonical items and the dataset version, then mounts ItemBrowserClient.

### /repair-calculator
Entry: app/repair-calculator/page.tsx
Server-renders the repair calculator page by loading repairable items and mounting RepairCalculatorClient.

### /repair-calculator loading state
Entry: app/repair-calculator/loading.tsx
Loading skeleton for the repair calculator route segment.

### Global error boundary
Entry: app/error.tsx
App-wide error UI with a retry button and a link back to home.

## API routes

### GET /api/repair-economy
Entry: app/api/repair-economy/route.ts
Returns the repair economy dataset built from repair profiles, recipes, and related metadata.

### GET /api/version
Entry: app/api/version/route.ts
Returns the dataset version from rp_dataset_version.

### POST /api/revalidate
Entry: app/api/revalidate/route.ts
Revalidates cache tags or paths when the correct x-revalidate-token header is provided.

### GET /api/items/[id]/crafting
Entry: app/api/items/[id]/crafting/route.ts
Returns crafting components for a specific item.

### GET /api/items/[id]/recycling
Entry: app/api/items/[id]/recycling/route.ts
Returns recycling outputs for a specific item.

### GET /api/items/[id]/sources
Entry: app/api/items/[id]/sources/route.ts
Returns best recycling sources for a specific component.

### GET /api/items/[id]/used-in
Entry: app/api/items/[id]/used-in/route.ts
Returns items that use a specific component in their crafting recipe.
