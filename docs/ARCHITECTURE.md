# Architecture

## Overview
Raider Pal is a Next.js App Router app. The root layout in app/layout.tsx defines global chrome, metadata, fonts, and PWA registration. Pages under app/ load initial data on the server, while client components handle interactivity and cached API access.

## What lives where
- app/: App Router pages, API routes, global layout, and global styles.
- components/ui/: UI primitives such as Panel, Card, ModulePanel, SectionHeader, Button, ToolPanel, ToolGrid, PaginationControls, RarityBadge, and CostCard.
- components/rp/: Feature components for navigation, item browsing, repair tools, caching controls, and PWA helpers.
- components/CacheDebugPanel.tsx: Dev-only cache debug overlay mounted from the root layout.
- hooks/: Client hooks including useCachedJson, useAppVersion, useRaidReminders, and useOnlineStatus.
- lib/: Data access, validation, caching, HTTP helpers, and shared utilities.
- lib/data/: Server repositories, view contracts, and repair math. lib/data/client.ts re-exports client-safe types and math helpers.
- lib/types/: Shared domain types (for example, cost row shapes).
- public/: Static assets, PWA manifest, offline page, icons, and background imagery.
- scripts/: SQL helper scripts for data maintenance.
- tests/: Vitest tests, fixtures, and invariants.
- docs/: Project documentation.
- middleware.ts: Global security headers.
- next.config.ts: Next.js config, image host allowlist, and PWA integration.
- .github/workflows/: CI workflows.
