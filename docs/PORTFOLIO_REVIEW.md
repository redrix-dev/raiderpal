# Portfolio Review

## 1) What looks professional (strengths)
- Clear data contracts and row-level validation: view schemas are defined in `VIEW_CONTRACTS` and enforced in `queryView`/`queryViewMaybeSingle` via `schema.safeParse`. (lib/data/db/contracts.ts:9) (lib/data/db/query.ts:26)
- Consistent API envelopes and output validation: `jsonOk`/`jsonError` standardize responses and `assertResponseShape` validates outgoing payloads before returning. (lib/http.ts:94) (lib/http.ts:165) (app/api/items/[id]/crafting/route.ts:60)
- Security headers are centralized in middleware (CSP, X-Frame-Options, etc.). (middleware.ts:26) (middleware.ts:50)
- UI system primitives with variants and predictable layout wrappers (Panel/ToolShell). (components/ui/Panel.tsx:5) (components/ui/Panel.tsx:28) (components/ui/ToolShell.tsx:14)
- Client caching is explicit and documented: localStorage TTL, versioned keys, and LRU-style eviction. (lib/clientCache.ts:4) (lib/clientCache.ts:89) (lib/clientCache.ts:147)
- Tests and fixtures exist with a configured runner (Vitest + fixture helpers). (package.json:11) (vitest.config.ts:6) (tests/contracts.datasetVersion.test.ts:12) (tests/helpers/readJsonFixture.ts:4)

## 2) What would be criticized in a real review
- Item Browser loads the full dataset server-side and paginates on the client. (app/item-browser/page.tsx:18) (lib/data/items.repo.ts:118) (components/rp/ItemBrowserClient.tsx:83)
- Repair calculator hard-codes `repairStep = 50`, overriding profile `step_durability`. (components/rp/RepairCalculatorClient.tsx:34) (components/rp/RepairCalculatorClient.tsx:87)
- ItemPicker dropdown height is fixed (360/370px), which does not adapt to small viewports. (components/rp/ItemPicker-portal.tsx:50) (components/rp/ItemPicker-portal.tsx:100)
- RangeSlider disables touch scrolling with `touch-none`. (components/rp/RangeSlider.tsx:112)
- README only documents `npm run dev` with no test/build/env setup guidance. (README.md:59)

## 3) Risk register (top 10)
1) Performance: full item dataset is fetched server-side, and filtering/pagination happens in the client. (app/item-browser/page.tsx:18) (lib/data/items.repo.ts:118) (components/rp/ItemBrowserClient.tsx:83)
2) Correctness: repair calculator overrides profile step durability with a constant. (components/rp/RepairCalculatorClient.tsx:34) (components/rp/RepairCalculatorClient.tsx:87)
3) Mobile UX: ItemPicker dropdown has fixed height values that are not viewport-derived. (components/rp/ItemPicker-portal.tsx:50) (components/rp/ItemPicker-portal.tsx:100)
4) Mobile UX: slider disables touch scrolling via `touch-none`. (components/rp/RangeSlider.tsx:112)
5) Data consistency: dataset version repository falls back to the first row if `global` is missing. (lib/data/version.repo.ts:11) (lib/data/version.repo.ts:15)
6) Security: CSP explicitly allows `unsafe-inline` and `unsafe-eval`. (middleware.ts:38) (middleware.ts:43)
7) Observability: global error boundary logs only to console. (app/error.tsx:10) (app/error.tsx:12)
8) Caching scope: PWA runtime caching applies to all `https?` requests with NetworkFirst. (next.config.ts:46) (next.config.ts:49)
9) DX: Supabase env vars are required, but README does not document setup. (lib/supabase.ts:8) (README.md:59)
10) Build artifact hygiene: `next-pwa` writes to `public/`, and a bundled `public/sw.js` is present. (next.config.ts:38) (next.config.ts:39) (public/sw.js:1)

## 4) Highest ROI fixes (max 10)
- Make ItemPicker dropdown max-height responsive. Why: dropdown height is hard-coded to 360/370px instead of being viewport-derived. (components/rp/ItemPicker-portal.tsx:50) (components/rp/ItemPicker-portal.tsx:100) Effort: S. Files: `components/rp/ItemPicker-portal.tsx`. Verify: `npm run dev`, open picker at ~320px height, confirm list stays within viewport. (package.json:6)
- Add a scroll-friendly RangeSlider option and opt-in on Repair Calculator. Why: `touch-none` blocks vertical scroll. (components/rp/RangeSlider.tsx:112) Effort: S. Files: `components/rp/RangeSlider.tsx`, `components/rp/RepairCalculatorClient.tsx`. Verify: `npm run dev`, scroll page while dragging slider on mobile. (package.json:6)
- Align repair step with profile `step_durability`. Why: `repairStep` overrides profile values. (components/rp/RepairCalculatorClient.tsx:34) (components/rp/RepairCalculatorClient.tsx:87) Effort: S. Files: `components/rp/RepairCalculatorClient.tsx`. Verify: add/update unit test in `lib/data/repairs.math.test.ts` and run `npm test`. (lib/data/repairs.math.test.ts:5) (package.json:11)
- Add server-side pagination or a default limit to item queries. Why: `listCanonicalItems()` defaults to full dataset with client-side pagination. (lib/data/items.repo.ts:118) (components/rp/ItemBrowserClient.tsx:83) Effort: M. Files: `lib/data/items.repo.ts`, `app/item-browser/page.tsx`, `components/rp/ItemBrowserClient.tsx`. Verify: `npm run dev`, confirm page still paginates and requests are bounded. (package.json:6)
- Document env requirements and add `.env.example`. Why: Supabase env vars are required and not documented. (lib/supabase.ts:8) (README.md:59) Effort: S. Files: `README.md`, `.env.example` (new). Verify: `npm run dev` with values from `.env.example`. (package.json:6)
- Tighten CSP in production (avoid `unsafe-eval/inline`). Why: CSP currently allows both unconditionally. (middleware.ts:38) (middleware.ts:43) Effort: M. Files: `middleware.ts`. Verify: `npm run build` and manual smoke test. (package.json:7)
- Clarify service worker ownership (generated vs tracked). Why: `next-pwa` outputs to `public/` and `public/sw.js` exists. (next.config.ts:38) (next.config.ts:39) (public/sw.js:1) Effort: S. Files: `next.config.ts`, `.gitignore`, `public/sw.js` (decision). Verify: `npm run build` and `git status` is clean. (package.json:7)

## 5) README checklist for strong repo presentation
- [x] Project summary and live URL. (README.md:1) (README.md:5)
- [x] Stack overview. (README.md:9)
- [x] Architecture highlights. (README.md:17)
- [x] UI map / key screens. (README.md:39)
- [ ] Environment variables + `.env.example`. Not found.
- [ ] Test/build commands. Not found.
- [ ] Deployment notes (preview/prod). Not found.
- [ ] Screenshots or GIFs. Not found.
- [ ] License. Not found.

## 6) Testing strategy
- What exists: Vitest config with `@` alias and `npm test` script. (vitest.config.ts:6) (package.json:11)
- What exists: unit tests for repair math and dataset version fixtures/invariants. (lib/data/repairs.math.test.ts:5) (tests/contracts.datasetVersion.test.ts:12) (tests/invariants/datasetVersion.invariants.ts:7)
- What is missing: API route tests for `/api/items/*` and `/api/version`. Not found.
- What is missing: UI/component tests for Item Browser and Repair Calculator flows. Not found.
- Next test: API param validation and error envelope for `/api/items/[id]/crafting`. (app/api/items/[id]/crafting/route.ts:43) (lib/apiSchemas.ts:32) (lib/http.ts:110)
- Next test: API version route response shape + cache headers. (app/api/version/route.ts:17) (app/api/version/route.ts:22) (lib/apiSchemas.ts:119)
- Next test: Dataset version fallback behavior when `global` is missing. (lib/data/version.repo.ts:11) (lib/data/version.repo.ts:15)
- Next test: Contract validation for `VIEW_CONTRACTS.metadata` rows using fixtures. (lib/data/db/contracts.ts:10)

## 7) CI/CD
- Current CI runs lint, typecheck, tests, and build on PRs and main/staging. (ci.yml:3) (ci.yml:24) (ci.yml:27) (ci.yml:31) (ci.yml:34)
- Gaps: no deploy workflow. Not found.
- Gaps: no coverage reporting. Not found.
- Minimal improvement: add coverage reporting to Vitest and upload in CI. (vitest.config.ts:6) (ci.yml:31)
- Minimal improvement: add a deploy workflow or document external deploy (Vercel). Not found.

## 8) Final verdict
- Ship as-is only if this is a prototype. For a portfolio-grade repo, do <=5 things first: responsive ItemPicker height, touch-friendly RangeSlider, align repair step with profile data, document env/test commands, and decide ownership of `public/sw.js`. (components/rp/ItemPicker-portal.tsx:50) (components/rp/RangeSlider.tsx:112) (components/rp/RepairCalculatorClient.tsx:34) (README.md:59) (public/sw.js:1)
