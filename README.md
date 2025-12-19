# Raider Pal

ARC Raiders companion that answers “what do I need, where do I get it, and is repair cheaper than crafting?” Built to stay fast, contract-safe, and easy to extend.

Live site: https://raiderpal.vercel.app

---

## Stack

- **Next.js (App Router) + React + TypeScript** for server-rendered shells and interactive clients.
- **Tailwind CSS** for styling with shared Panel/Module shells to keep layout consistent.
- **Supabase Postgres** for data and a small Edge function for ingest; **Vercel** for deploy/analytics.

---

## Architecture highlights (the "why")

- **Server owns data; clients fetch via API envelopes** – DB access lives in `lib/data/**` (see `docs/app-architecture.md`) to avoid leaking keys and to centralize business logic and schema validation.
- **Security-first design** – Input sanitization on search filters, ID parameter validation with character whitelisting, comprehensive security headers middleware (CSP, X-Frame-Options, etc.), and LRU cache eviction for localStorage quota handling.
- **Views are contracts** – the app only consumes `rp_view_*` shapes; see `docs/contracts.md` and `docs/raiderpal-db-architecture.md` for the rationale and invariants.
- **Metadata enrichment instead of ad-hoc fields** – repositories attach `metaById` to rows so UI never guesses names/icons/rarity.
- **Version-aware caching** – `useCachedJson` + `useAppVersion` keep client fetches aligned with `rp_dataset_version`; long-term cache toggle is exposed in the header. Client cache includes LRU eviction policy for graceful localStorage quota handling.
- **Tools are modular** – each feature is its own page + client component (`ItemsBrowseClient`, `RecycleHelperClient`, `RepairCalculatorClient`, etc.) composed from reusable building blocks (`SearchControls`, `PaginationControls`, `PreviewModal`) so new calculators can be added without touching existing flows.

---

## Data pipeline (high level)

`MetaForge source -> Supabase Edge ingest -> rp_items_ingest -> rp_items_patches -> rp_items_canonical -> rp_view_* -> API routes/server components -> UI`

- Ingest is append-only; canonical is minimal and stable.  
- Views provide the only shapes the app trusts.  
- API routes return `{ success, data }` envelopes; clients validate and render.  
- Schema introspection queries live in `docs/rp-schema-introspection-queries.sql`; snapshots in `docs/rp-schema-introspection-snapshot.md`.

---

## UI map

- Home tiles route to Item Browser, Recycle Helper, Repair/Replace Calculator, and Repair Breakdown (`app/page.tsx`).
- Item Browser (`app/items/browse/page.tsx` + `ItemsBrowseClient`) handles search, rarity filters, pagination, and per-item previews.
- Item Detail (`app/items/[id]/page.tsx`) stitches metadata, stats, and crafting/recycling/sources/used-in tabs.
- Recycle Helper (`app/recycle-helper/page.tsx` + `RecycleHelperClient`) flips between “Need” and “Have” modes with mode-specific filters.
- Repair tools (`app/repair-calculator`, `app/repair-breakdown`) render repair math via shared cost cards.
- UI ownership and composition diagrams live under `docs/mermaid_diagrams/` (e.g., `ui-route-and-composition.md`, `ui-ownership-index.md`).

---

## Key docs

- App-side architecture: `docs/app-architecture.md`
- Database architecture (authoritative): `docs/raiderpal-db-architecture.md`
- Data contracts: `docs/contracts.md`
- Query lexicon (operational SQL): `docs/rp-db-query-lexicon.sql`
- Schema introspection: `docs/rp-schema-introspection-queries.sql`, `docs/rp-schema-introspection-snapshot.md`
- Refactor notes: `REFactorNotes.md`

---

## Running locally

```bash
git clone https://github.com/redrix-dev/raider-pal.git
cd raider-pal
npm install
npm run dev
```
