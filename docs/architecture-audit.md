# Architecture Documentation Audit (UI-focused)

## Scope
Reviewed the following documentation and compared against the implementation:
- docs/UI_SYSTEM.md
- docs/ARCHITECTURE.md
- docs/DATA_FLOWS.md
- docs/ROUTES.md
- docs/app-architecture.md
- docs/contracts.md
- docs/raiderpal-db-architecture.md
- docs/rp-db-query-lexicon.sql
- docs/rp-schema-introspection-queries.sql
- docs/rp-schema-introspection-snapshot.md
- docs/ui-ownership-index.md

## Findings

### CRITICAL
- None found in this pass.

### MINOR (outdated or inconsistent)
- UI_SYSTEM.md states that tool pages use ToolPanel for consistent padding/width, but the Item Browser page uses a custom `<main>` container instead of ToolPanel.
- UI_SYSTEM.md lists ItemDetailsModal as a portal-based modal, but the implementation renders it inline with a fixed overlay (no portal).
- UI_SYSTEM.md refers to a LongCacheToggle component, but the code exposes LongCacheIndicator and LongCacheSettingsModal (LongCacheToggle is not an exported component).
- rp-schema-introspection-queries.sql instructs saving snapshots under docs/db/schema-introspection-snapshot.md, but the actual snapshot lives at docs/rp-schema-introspection-snapshot.md.

### MISSING (implementation patterns not documented)
- The Item Browser and Repair Calculator pages load their client components via next/dynamic with route-specific loading skeletons.
- ItemDetailsModal enforces a body scroll lock and a simple focus trap (Tab cycling) while open, plus hides blueprint components and hides weapon sources by default.
