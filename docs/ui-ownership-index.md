# Raider Pal UI Index

This guide maps the UI ownership and shows where to work when adjusting screens or flows. Pair this with `docs/app-architecture.md` for data-path details.

graph TD
  Shell["Root shell\napp/layout.tsx"] --> Header["HeaderControls\n+ TopNavMenu\n+ LongCacheIndicator\n+ RaidRemindersDrawer"]
  Shell --> Routes["Page routes in app/*"]
  Routes --> Home["Home / (app/page.tsx)\nModulePanel tiles linking to tools"]
  Routes --> ItemBrowser["Item Browser /item-browser\nItemBrowserClient"]
  Routes --> RepairCalc["Repair/Replace /repair-calculator\nRepairCalculatorClient"]
  ItemBrowser --> ItemBrowserParts["Search + filters + pagination\nItem cards with rarity\nItemDetailsModal\nuses useCachedJson -> /api/items/*"]
  RepairCalc --> RepairCalcParts["ItemPicker + CostCard panels\nuses computeRepairSummary"]

## Shell and navigation
- `app/layout.tsx`: Global chrome (header, footer stripe, max-width container) and font setup.
- `components/rp/HeaderControls.tsx`: Header right rail; owns reminder drawer toggling and cache indicator button.
- `components/rp/TopNavMenu.tsx`: Portal-based nav menu; owns routing links and Long Term Caching settings modal.
- `components/rp/RaidRemindersDrawer.tsx`: Slide-out list of saved items via `useRaidReminders`.
- `components/rp/LongCacheToggle.tsx`: Indicator + settings modal for cache duration.

## Shared building blocks

### UI Primitives (`components/ui/`)
- **Containers**: `Panel.tsx` (base card shell), `ModulePanel.tsx` (titled panel with rows), `ToolPanel.tsx` (Panel + spacing wrapper), `ToolShell.tsx` (page shell with width control), `Card.tsx` (lighter surface), `CardHeader.tsx` (card header component), `SectionHeader.tsx` (section header with accent option).
- **Actions**: `Button.tsx`, `PrimaryButton.tsx` (CTA button wrapper).
- **Display**: `RarityBadge.tsx` (rarity pill), `rarity.ts` (rarity class utilities).
- **Utilities**: `CostCard.tsx` (cost breakdown display), `PaginationControls.tsx` (page navigation with window).

### Raider Pal Components (`components/rp/`)
- **Navigation**: `HeaderControls.tsx`, `TopNavMenu.tsx`, `LongCacheToggle.tsx`, `RaidRemindersDrawer.tsx`.
- **Item Tools**: `ItemBrowserClient.tsx` (main item browser with search/filter/pagination), `ItemDetailsModal.tsx` (item detail modal with tabs), `ItemDetailsTabs.tsx` (crafting/recycling/sources/used-in tabs), `ItemPicker-portal.tsx` (searchable dropdown picker).
- **Calculators**: `RepairCalculatorClient.tsx` (repair vs replace calculator).

## Page owners (where to edit)

### Home (`app/page.tsx`)
Landing tiles built with `ModulePanel` + `PrimaryButton` links. Add/remove tools here.

### Item Browser (`app/item-browser/page.tsx`)
Server wrapper fetches item summaries + dataset version. UI lives in `components/rp/ItemBrowserClient.tsx` which handles:
- Search and rarity filtering
- Pagination
- Item cards with inline rarity badges
- Modal previews via `ItemDetailsModal` that fetch crafting/recycling/sources/used-in data via `useCachedJson`

### Repair/Replace Calculator (`app/repair-calculator/page.tsx`)
Server wrapper provides repairable items; `components/rp/RepairCalculatorClient.tsx` runs `computeRepairSummary` and renders `CostCard` components for per-cycle, crafting, recycling, and net costs.

## Data and state on the UI
- **Server vs client**: Pages fetch initial data on the server via `lib/data/**` repositories. Client components fetch incremental detail via `/api/items/*` using `useCachedJson` plus schemas from `lib/apiSchemas.ts`.
- **Caching/versioning**: `useAppVersion` and `dataVersion` props keep client fetches aligned with the dataset version. Long cache toggle controls `useCachedJson` durations.
- **Local state helpers**: `useRaidReminders` (persistent reminders), `useCachedJson` (validated fetch + cache), `useAppVersion` (reads API-reported version).
- **Styling**: Tailwind + semantic theme tokens in `tailwind.config.js` and `app/globals.css`. Always use theme colors (e.g., `text-primary`, `bg-surface-base`, `border-border-strong`) over default Tailwind classes or hardcoded values. Prefer composing `Panel`/`Card` and existing utility patterns before adding new globals.
- **Density mode**: Page-level compact styling is opt-in via `ToolPanel` (`density="compact"`). Compact-only tweaks use the arbitrary variant selector `2xl:[.ui-compact_&]:...` so they only apply under a `.ui-compact` ancestor.

Example (compact-only tweak on a shared component):
<div className="p-4 2xl:[.ui-compact_&]:p-3 space-y-3 2xl:[.ui-compact_&]:space-y-2.5">
  ...
</div>

## Component organization

### `components/ui/` - Primitive/reusable components
All generic, reusable UI building blocks live here. These are framework-agnostic and could theoretically be extracted to a design system:
- Layout shells (`Panel`, `Card`, `ModulePanel`, `ToolPanel`, `ToolShell`)
- Interactive elements (`Button`, `PrimaryButton`)
- Display components (`RarityBadge`, `CostCard`, `PaginationControls`)
- Utilities (`rarity.ts` for class recipes)

### `components/rp/` - Raider Pal-specific composite components
Feature-level components that combine UI primitives with domain logic:
- Navigation and global UI (`HeaderControls`, `TopNavMenu`, `RaidRemindersDrawer`, `LongCacheToggle`)
- Item-related features (`ItemBrowserClient`, `ItemDetailsModal`, `ItemDetailsTabs`, `ItemPicker-portal`)
- Calculators (`RepairCalculatorClient`)

**Rule**: Main pages (`app/page.tsx`, `app/item-browser/page.tsx`, `app/repair-calculator/page.tsx`) should only import from `components/ui/` and `components/rp/`. No root-level component imports.

## How to adjust or extend the UI

### Add a new tool tile on Home
Update `app/page.tsx` with a `ModulePanel` entry and a `PrimaryButton` to the route; keep copy short and action-focused.

### Add a filter to the Item Browser
Add state + filter logic in `components/rp/ItemBrowserClient.tsx`, wire inputs above the grid, and reset pagination when filters change.

### Add an action to item previews
Add buttons inside the `ItemDetailsModal` in `components/rp/ItemBrowserClient.tsx`; keep keyboard handling (Enter/Space) intact.

### New data on item detail
Add fields to the `get*` repo functions in `lib/data`, return them from the API if needed, and render in `ItemDetailsModal` or a new tab in `ItemDetailsTabs`.

### New calculator view
Create `app/<tool>/page.tsx` as a server wrapper that loads data via `lib/data`, then build a client component under `components/rp/` using `ToolPanel` or `ModulePanel` for layout.

### To tighten desktop spacing on a single page
Set `density="compact"` on that page's `ToolPanel`, then add compact overrides in shared components using `2xl:[.ui-compact_&]:...` (avoid per-page one-off classes).

## Usage examples

### Show a new numeric stat on item detail
Extend the relevant repo/select in `lib/data/items.repo.ts`, pass the field through the API route, and render it inside `ItemDetailsModal` (add a badge block mirroring existing ones).

### Add a "Workbench" filter to Item Browser
Add state to `components/rp/ItemBrowserClient.tsx`, include it in `filtered`, and add a `<select>` alongside the rarity dropdown; remember to `setPage(1)` when it changes.

### Surface reminder controls on any list
Import `useRaidReminders`, use `isAdded(id)` to mark active rows, and `add`/`addMany` for actions; prefer passing small action buttons into item cards.

## Pointers for junior contributors
- Start from the page file under `app/*` to see what data is loaded and which client component actually renders the UI.
- Follow the pattern: server fetch for initial payload -> client component for interactions -> API routes for per-item detail via `useCachedJson`.
- Reuse shells (`Panel`, `ModulePanel`, `ToolPanel`) to get spacing, borders, and text styles "for free" and avoid one-off CSS.
- Keep fetch validation on: when adding an API response, supply `responseSchema`/`dataSchema` to `useCachedJson` so contract issues fail loudly.
- All components are organized in `ui/` (primitives) or `rp/` (feature-level); never import from root `components/` folder.
