# Build, CI, and PWA

## Scripts (package.json)
- dev: next dev
- build: next build
- start: next start
- lint: eslint
- typecheck: tsc --noEmit
- test: vitest run
- test:watch: vitest

## Next.js config (next.config.ts)
- Image remote patterns allow cdn.metaforge.app and an optional Supabase host derived from SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.
- PWA configuration is enabled outside development using next-pwa. The config is wrapped in a try/catch; if next-pwa fails to load, the base config is used without PWA.

## PWA assets and registration
- When enabled, next-pwa emits /sw.js and runtime cache entries into public/.
- The offline fallback document is public/offline.html.
- The PWA manifest is public/manifest.json and referenced by root metadata in app/layout.tsx.
- components/rp/PWARegistration.tsx registers /sw.js in production.

## Environment variables (build/runtime)
- SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL for image host allowlist and Supabase client setup.
- SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY for anonymous Supabase access.
- SUPABASE_SERVICE_ROLE_KEY (and related service-role variants) for service client access when used.
- NEXT_PUBLIC_SITE_URL for metadata base URL.
- REVALIDATE_TOKEN for the /api/revalidate endpoint.
- NODE_ENV toggles PWA configuration and registration.

## CI (GitHub Actions)
- Runs on pushes to main/staging and on pull requests.
- Uses Node 20, installs dependencies with npm ci, then runs lint, typecheck, test, and build.
