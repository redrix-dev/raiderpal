# Raider Pal Copilot Instructions

## Architecture Overview
Raider Pal is a Next.js App Router application for ARC Raiders game companion, focusing on item crafting, recycling, and repair calculations.

- **Data Ownership**: Server-side owns data access via `lib/data/` repositories; clients fetch via API routes with consistent `{ success: true, data }` or `{ success: false, error: { code, message } }` envelopes.
- **Data Pipeline**: External data → Supabase ingest → patches → canonical (minimal jsonb) → read-only `rp_view_*` contracts → API routes → UI.
- **Views as Contracts**: App only consumes validated `rp_view_*` shapes (e.g., `rp_view_metadata`, `rp_view_crafting_normalized`); see `docs/contracts.md`.
- **Metadata Enrichment**: Repositories attach `metaById` maps to rows for UI consistency, avoiding ad-hoc name/icon fields.

## Key Patterns
- **API Routes**: Validate params with schemas, call repository functions, return envelopes; e.g., `app/api/items/[id]/crafting/route.ts`.
- **Repositories**: Use `queryView` for Supabase queries with schema validation; enrich with metadata; e.g., `lib/data/items.repo.ts`.
- **Client Components**: Use `useCachedJson` with `useAppVersion` for version-aware caching; validate responses; e.g., `components/ItemsBrowseClient.tsx`.
- **Component Naming**: Client-side components end with "Client" (e.g., `RecycleHelperClient`, `RepairCalculatorClient`).
- **Styling**: Tailwind CSS with shared `Panel`/`Module` components for consistent layouts.

## Development Workflow
- **Dev Server**: `npm run dev`
- **Build**: `npm run build` (includes typecheck)
- **Typecheck Only**: `npm run typecheck`
- **Lint**: `npm run lint`
- **Debugging**: Check API envelopes in network tab; errors surface as `{ success: false, error }`.

## Examples
- **Adding Item Data**: Create repo function in `lib/data/`, API route in `app/api/`, fetch in client component with schema validation.
- **New Tool Page**: Add page in `app/`, client component with "Client" suffix, integrate with existing UI patterns.
- **Refer to Docs**: `docs/app-architecture.md` for data flows, `docs/raiderpal-db-architecture.md` for DB invariants.