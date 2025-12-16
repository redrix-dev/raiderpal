# RaiderPal Database Architecture (Authoritative Reference)

This document is the **source of truth** for how the RaiderPal database is designed, why it exists in its current form, and how it must be interacted with. New contributors, new chat sessions, and future-you should be able to read *only this file* and work safely without breaking invariants.

---

## Core Design Principles

### 1) Manual Truth Beats Inferred Truth
Some game data (notably **repair mechanics**) is **not exposed by the API**. Attempts to infer it programmatically led to fragile logic and hidden assumptions.

**Rule:** If the game does not expose data, we author it manually and store it explicitly.

---

### 2) Layered Data Pipeline (Do Not Bypass)

rp_items_ingest (API payloads)
↓
rp_items_patches (manual corrections / overrides)
↓
rp_items_canonical (authoritative, minimal)
↓
read-only views (app consumption contracts)


**Rules:**
- `rp_items_ingest` is the landing zone for external data.
- `rp_items_patches` exists to *fix holes*, not to invent systems.
- `rp_items_canonical` is the **only table the app should treat as authoritative**.
- The app must never read directly from ingest or patches.

---

### 3) Canonical Is a Minimal Table (On Purpose)

`rp_items_canonical` is a **material table** with an intentionally minimal shape:

- `id` (text PK)
- `payload` (jsonb)
- `updated_at` (timestamptz)

Why:
- Stable foreign key target
- Predictable performance
- Clear refresh boundaries
- Canonical stays stable even if payload fields shift

**App rule:** the app should not query canonical payload directly except through read-only views that extract stable fields.

---

## Patch-Day Ingest Workflow (Automatic)

### What happens on patch day
1. Run the Edge Function that pulls MetaForge items and writes ONLY to `rp_items_ingest`.
2. A trigger refreshes canonical for changed rows (no manual rebuild loop).
3. Review deltas via ingest timestamps and/or `rp_items_needing_any_patch`.
4. Patch or ignore only what actually needs attention.

### Safety note
Prefer the **RPC batch upsert** pattern that only updates when the payload changed. This avoids firing canonical refresh triggers unnecessarily for unchanged rows.

---

## View-First App Consumption (Contracts)

### Why views exist
- Keep frontend types stable
- Prevent pages from depending on raw payload shape
- Keep “feature data” (crafting/recycling/repairs) consistent and queryable

### Existing app-facing views
- `rp_view_metadata`: item browser / display fields (id, name, type, rarity, icon, etc.)
- `rp_view_crafting_normalized`: crafting components (normalized rows)
- `rp_view_recycling_outputs`: recycling outputs (normalized rows)

### App stitching is intentional
The app may call multiple views and stitch results in code:
- `ItemDetails` from `rp_view_metadata`
- Crafting from `rp_view_crafting_normalized`
- Recycling from `rp_view_recycling_outputs`
- Repairs from `rp_view_repair_recipes`

This avoids join explosions (crafting × recycling × repair) and keeps each feature query simple.

---

## Repair System Architecture (Critical Section)

### Why repairs are special
- Repair data is **not provided by the API**
- It is **stable but manually discovered**
- It must be editable without cascading side effects

Repairs therefore use an explicit two-table model (no JSON blobs, no “smart inference”).

---

## Repair Tables (Exactly Two)

### `rp_repair_profiles`
**One row per repairable item.** Declares *how* repairs work.

Key columns:
- `item_id` (PK, FK → `rp_items_canonical.id`)
- `max_durability`
- `step_durability` (default 50; durability restored per repair cycle)
- `notes`

Meaning:
> “This item is repairable, and this is how durability behaves.”

---

### `rp_repair_recipes`
**Many rows per item.** One row per component per repair cycle.

Key columns:
- `id` (row PK, uuid default `gen_random_uuid()`; app must not use)
- `item_id` (FK → `rp_repair_profiles.item_id`)
- `component_item_id` (FK → `rp_items_canonical.id`)
- `quantity_per_cycle`

Meaning:
> “For one repair cycle, this item consumes these components.”

---

### Explicit Non-Features (By Design)
The following are intentionally not modeled:
- Cheap/expensive thresholds
- Durability bands
- Smart inference logic
- JSON blobs for repair costs

If repair behavior ever differs by durability band, model it explicitly (new columns/rows) rather than inferring it.

---

## Repair Math (Derived, Never Stored)

**Repair cycles are computed (never stored):**
- missing = max_durability - current_durability
- cycles = ceil(missing / step_durability)

**Component cost:**
- quantity_per_cycle * cycles

**No table should store:**
- number of repairs needed
- total repair cost

---

## App-Facing Repair Contract (View)

Even though `rp_repair_recipes` is normalized and safe, the app should not depend on internal row IDs.

**Contract view:**
- `rp_view_repair_recipes` (item_id, component_item_id, quantity_per_cycle)

This keeps the app consistent with the “views are contracts” approach used for metadata/crafting/recycling.

---

## Referential Integrity Rules (Must Hold)

- `rp_repair_profiles.item_id` → `rp_items_canonical.id`
- `rp_repair_recipes.item_id` → `rp_repair_profiles.item_id`
- `rp_repair_recipes.component_item_id` → `rp_items_canonical.id`

Deletion rules:
- Canonical item deletion: RESTRICT
- Profile deletion: CASCADE to recipes

---

## Operational Workflows (Canonical)

### Adding a new repairable item
1. Insert into `rp_repair_profiles`
2. Insert rows into `rp_repair_recipes`

This can be done via SQL or the Table Editor; order matters (profile first).

### Editing an existing repair
Safe via Supabase Table Editor. Constraints prevent corruption.

### Replacing a recipe entirely
Delete recipe rows for the item, then insert the new set.

---

## Debug & Safety Views/Queries

Diagnostics should live as views and named queries (lexicon), not ad-hoc SQL.

Examples:
- repair profiles missing recipes
- invalid quantities
- patch worklists
- ingest/canonical counts

---

## Final Invariants (Memorize These)

- Canonical table is authoritative
- Repair data is manual and explicit
- JSON blobs are forbidden for canonical feature systems
- Derived values are never stored
- If something feels “smart,” it is probably wrong

This document overrides intuition. Follow it even when tempted not to.
