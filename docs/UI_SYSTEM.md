# UI System

## Styling and tokens
- Tailwind CSS is imported in app/globals.css, with theme tokens defined as CSS variables and referenced by Tailwind classes.
- Fonts are loaded via next/font (Barlow and Barlow Condensed) and exposed as CSS variables in app/layout.tsx.
- lib/cn.ts provides a small class name helper used across UI components.

## Layout composition
- app/layout.tsx renders the header, main container, footer stripe, footer copy, PWA registration, analytics, and the dev-only cache debug panel.
- Tool pages use ToolPanel for consistent padding and width, with SectionHeader + Card blocks for page summaries.
- Modals and drawers use portals (ItemDetailsModal, ItemPicker dropdown, RaidRemindersDrawer, LongCacheSettingsModal, TopNavMenu).

## UI primitives (components/ui)
- Panel: surface container with variant and padding options.
- Card: content grouping with surface variants.
- ModulePanel: titled panel used for home page tiles.
- SectionHeader: dark chrome header with optional accent stripe.
- CardHeader: reusable dark header for cards and modals.
- Button and PrimaryButton: action components with styled variants.
- ToolShell, ToolPanel, ToolGrid: layout wrappers for page shells and two-column tool layouts.
- PaginationControls: paginated list controls.
- RarityBadge and rarityClasses: centralized rarity styling helpers.
- CostCard: cost breakdown display card.

## Feature components (components/rp)
- HeaderControls, TopNavMenu, LongCacheToggle, RaidRemindersDrawer: global navigation and caching controls.
- ItemBrowserClient, ItemDetailsModal, ItemDetailsTabs, ItemRowCard, ItemPicker-portal: item browsing and detail UI.
- RepairCalculatorClient, RangeSlider: repair calculator UI and slider input.
- PWARegistration: service worker registration hook for production.
- InstallPrompt: standalone PWA install prompt component (present but not mounted in the root layout).

## UI state and storage
- Raid reminders are stored in localStorage under raid-reminders:v1 and surfaced via useRaidReminders.
- Long-term cache preference is stored under rp_long_cache_enabled.
- Cached API entries use the rp_cache_v1: prefix in localStorage.

## Density and spacing
- ToolPanel can render density="compact", which adds a ui-compact class used by shared components for compact spacing overrides.

## Dev-only UI
- CacheDebugPanel listens for cache-debug events and renders a draggable overlay in development builds.
