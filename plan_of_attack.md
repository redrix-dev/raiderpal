Got it. I’ll redo the checklist with Next.js 15 in mind and **not** tell you to remove the `Promise<Params>` pattern.

Everything below assumes:

* App Router
* Next 15 behavior where `params` can be awaited as a promise in route handlers
* Your current pattern like:

  ```ts
  export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<Params> }
  ) {
    const { id } = await params;
    ...
  }
  ```

---

## 1. Codebase cleanup & structure

### 1.1. Remove or quarantine `adjustments_gpt/`

**Where:** `adjustments_gpt/app`, `adjustments_gpt/components`

These are alt versions and will drift.

* [ ] Decide if they’re:

  * Deleted,
  * Moved into `docs/` or `experiments/`,
  * Or only kept on a separate branch.
* [ ] Keep `app/` + `components/` as the single source of truth for runtime code.

### 1.2. Enforce the “layers” model

You’re already mostly here:

* `app/` – routing & page/server component composition, route handlers.
* `components/` – reusable UI & client components.
* `data/` – Supabase queries & mapping.
* `lib/` – helpers (Supabase client, calc logic, caching, utilities).
* `hooks/` – client-side state (`useRaidReminders`, etc).

Checklist:

* [ ] No Supabase calls from `components/`; only from `data/*` or `lib/supabaseServer.ts`.
* [ ] Route handlers in `app/**/route.ts` do:

  * param parsing/validation
  * call into `data/*`
  * return HTTP response
    and *nothing more*.

### 1.3. Tighten TS lint rules slightly (later)

`eslint.config.mjs` currently turns off a bunch of stuff.

* [ ] After you’re done with major iteration, re-enable or set to “warn” for `@typescript-eslint/no-explicit-any` so your `data/*` and `lib/*` stay typed.
* [ ] Consider a custom rule / lint config to prevent importing `@/lib/supabaseServer` from client components.

---

## 2. API / data layer (Next 15–friendly)

### 2.1. Standardize your **async params** usage (don’t remove it)

For Next 15, your existing pattern is fine:

```ts
type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;

  if (!id || typeof id !== "string" || !id.trim()) {
    return jsonError("Missing or invalid id", 400);
  }

  // call data layer here
}
```

Checklist:

* [ ] Make sure **all** of these routes use this same shape (no mixing sync/async context types):

  * `app/items/[id]/crafting/route.ts`
  * `app/items/[id]/recycling/route.ts`
  * `app/items/[id]/sources/route.ts`
  * `app/items/[id]/used-in/route.ts`
  * any others using `[id]` segments.
* [ ] Define a small helper type if you want:

  ```ts
  type RouteContext<T> = { params: Promise<T> };
  ```

  and then:

  ```ts
  export async function GET(
    _req: NextRequest,
    { params }: RouteContext<Params>
  ) { ... }
  ```

So we keep the `Promise<Params>` approach and just make it consistent.

---

### 2.2. Standardize error responses

Make a helper in `lib/http.ts`:

```ts
export function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
```

Checklist:

* [ ] Refactor all route handlers to use `jsonError` instead of hand-building `new Response(JSON.stringify({ error: ... }))`.
* [ ] Use it for:

  * missing/invalid `id`
  * DB errors you want to expose generically (“Failed to load item”, etc.).

---

### 2.3. Keep `data/*` focused on querying + mapping

You already do this well:

* Functions in `data/repairEconomy.ts`, `data/recycling.ts`, `data/crafting.ts`, `data/yields.ts`, `data/usedIn.ts`, `data/items.ts`, `data/version.ts`:

  * Call Supabase.
  * Map to typed rows.
  * Do light post-processing.

Checklist:

* [ ] Move helpers like `coerceNumber` and generic JSONB parsing (`parseCostList` etc.) into `lib/` if they’re used in multiple `data/*` modules.
* [ ] Make sure all `data/*` exports have explicit return types (so refactors fail loudly).

---

## 3. Components & UI

You’ve already started doing “lego” components. The main push now is to actually use them everywhere you can.

### 3.1. Use `ItemPicker` instead of bespoke dropdowns

You now have `components/ItemPicker.tsx`.

Checklist:

* [ ] Refactor `RecycleHelperClient` to use `<ItemPicker>` directly instead of managing its own `pickerOpen`, `pickerQuery`, item list rendering.
* [ ] Refactor `RepairCalculatorClient` to also use `<ItemPicker>` for the item dropdown.
* [ ] Leave mode-specific filtering (`hideWeapons`, `needableIds/haveableIds`) in the parent, and pass the filtered list into `ItemPicker`.

`ItemPicker` should be “dumb UI” + search; parents decide *which* items it sees.

---

### 3.2. Use `SelectedItemSummary` consistently

`components/SelectedItemSummary.tsx` is the generic “selected item header”.

Checklist:

* [ ] Confirm both `RecycleHelperClient` and `RepairCalculatorClient` use `SelectedItemSummary` instead of inline copies of:

  * icon
  * name
  * rarity badge
  * type pill
  * max durability (where relevant)
* [ ] If any other screen shows a “current item” panel (e.g. future tools), plug this in first.

---

### 3.3. Use `TwoOptionToggle` for all 2-state toggles

`components/TwoOptionToggle.tsx` is your generic two-option switch.

Checklist:

* [ ] Replace the inline “I need this / I have this” toggle in `RecycleHelperClient` with:

  ```tsx
  <TwoOptionToggle<Mode>
    value={mode}
    onChange={setMode}
    optionA={{ value: "need", label: "I need this item" }}
    optionB={{ value: "have", label: "I have this item" }}
  />
  ```

* [ ] Reuse the same component if you add other binary toggles later (e.g. “Repair vs Craft”, “Cheap vs Expensive”).

---

### 3.4. Extract a `ToolPanel` / `PageShell` for outer card layout

Multiple pages wrap content in essentially the same card:

* `app/page.tsx`
* `app/tools/recycle/page.tsx`
* `app/tools/repair/page.tsx`
* `app/items/browse/page.tsx`
* `app/items/[id]/page.tsx`

They share classes like:

```tsx
<div className="rounded-xl border border-[#130918] bg-panel-texture p-4 sm:p-5 space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.6)] min-h-[70vh] lg:min-h-[75vh] xl:min-h-[79vh]">
  ...
</div>
```

Checklist:

* [ ] Create `components/ToolPanel.tsx`:

  ```tsx
  export function ToolPanel({ children }: { children: React.ReactNode }) {
    return (
      <div className="rounded-xl border border-[#130918] bg-panel-texture p-4 sm:p-5 space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.6)] min-h-[70vh] lg:min-h-[75vh] xl:min-h-[79vh]">
        {children}
      </div>
    );
  }
  ```

* [ ] Swap those repeated wrappers over to `<ToolPanel>...</ToolPanel>`.

---

### 3.5. Reuse the responsive “table vs cards” pattern

In `RecycleHelperClient` you now have:

* Mobile: card layout (quantity visible, no horizontal scroll).
* Desktop: full table.

Checklist:

* [ ] Leave logic (`displayNeed`, `displayHave`, `isAdded`, `toggleRow`) as a single source of truth.
* [ ] If you reuse this pattern in future tools (e.g. loot breakdown elsewhere), consider extracting:

  * `<RecycleResultRowCard />`
  * `<RecycleResultTableRow />`
    as separate tiny presentational components.

Not urgent, but a good next step if file length starts to annoy you.

---

## 4. Styling & layout

### 4.1. Use `cn` helper for conditional classes

You have a `cn` helper in `lib/cn.ts`.

Checklist:

* [ ] Replace string concatenation patterns like:

  ```tsx
  className={
    "rounded-md px-3 py-2 " +
    (hasSelection ? "..." : "...")
  }
  ```

  with:

  ```tsx
  className={cn(
    "rounded-md px-3 py-2",
    hasSelection
      ? "border-[#4fc1e9]/60 bg-[#4fc1e9]/15 text-[#4fc1e9] hover:border-[#4fc1e9]"
      : "cursor-not-allowed border-slate-800 bg-slate-900 text-warm-muted"
  )}
  ```

* [ ] Use `cn` consistently where you have shared base styles plus a couple of conditional variants.

---

### 4.2. Consolidate common card styles into Tailwind components

You have repeated patterns like:

* Panels: `rounded-md border border-slate-800 bg-slate-900/80 p-4`
* Cards: `rounded-lg border border-white/5 bg-black/20 p-4`
* Pills: small rounded tags for type, rarity, etc.

Checklist:

* [ ] In `globals.css`, add:

  ```css
  @layer components {
    .rp-card {
      @apply rounded-lg border border-white/5 bg-black/20 p-4;
    }

    .rp-panel {
      @apply rounded-md border border-slate-800 bg-slate-900/80 p-4;
    }

    .rp-pill {
      @apply inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-warm-muted;
    }
  }
  ```

* [ ] Replace the worst offenders with `className="rp-panel"` / `className="rp-card"` etc.

You don’t have to migrate everything—just high-frequency patterns.

---

### 4.3. Basic accessibility checks

You mostly do this already.

Checklist:

* [ ] Add `aria-expanded` to the buttons that open dropdowns (`ItemPicker`).
* [ ] Ensure loading states (`loading` booleans) always show some text indication (you already do “Loading results…” in places).
* [ ] Keep alt text meaningful; you’re already close.

---

## 5. Supabase / DB layer

From your dumps, core pieces include:

* Tables:

  * `items`
  * `item_economy_full`
  * `crafting_recipes`
  * `recycling_sources`
  * `item_repair_costs`
  * `item_repair_profiles`
  * `item_upgrade_costs`
  * `app_metadata`
  * plus staging: `item_repair_costs_stage`, `item_upgrade_costs_stage`, `staging_item_repair_cost`, `items_mega_pull_full`
* Views:

  * `view_item_economy`
  * `view_repairable_items`
  * `view_repair_candidates`
  * `view_crafting_recipes`
  * `view_recycling_sources`
  * `view_used_in_recipes`

### 5.1. Clean up or move staging tables

Checklist:

* [ ] If staging tables (`*_stage`, `items_mega_pull_full`, `staging_item_repair_cost`) are only used during ingestion:

  * Move them into a `staging` schema instead of `public`, **or**
  * Drop them after confirming they’re not wired into `data/*`.
* [ ] Document the pipeline briefly (even in a README):
  “Raw → staging → normalized tables → views consumed by `data/*`”.

---

### 5.2. Add indexes for hot lookups

Your data layer frequently does:

* `where item_id = ...` on crafting.
* `where component_id = ...` or `source_item_id = ...` on recycling.
* `where component_id = ...` / “used in” on used-in recipes.

Checklist (run as SQL in Supabase):

```sql
-- Crafting recipes lookups
create index if not exists idx_crafting_recipes_item_id
  on crafting_recipes (item_id);

create index if not exists idx_crafting_recipes_component_id
  on crafting_recipes (component_id);

-- Recycling lookups
create index if not exists idx_recycling_sources_component_id
  on recycling_sources (component_id);

create index if not exists idx_recycling_sources_source_item_id
  on recycling_sources (source_item_id);
```

These should speed up:

* `getCraftingForItem`
* `getRecyclingForItem`
* `getRecyclingIdSets`
* `getUsedInForItem`
* any view-based queries built on top of those tables.

---

### 5.3. Tighten nullability in views (where realistic)

In practice, your app assumes some columns are always present (e.g. `id`, `name` in economy views) even if they’re marked nullable in `information_schema`.

Checklist:

* [ ] For key views (`view_item_economy`, `view_repairable_items`, `view_recycling_sources`, `view_crafting_recipes`), confirm which columns “should never be null”.
* [ ] In view definitions, use `coalesce` where appropriate to avoid `null` for things like names/ids, or ensure base tables enforce `NOT NULL`.
* [ ] Update TS types in `data/*` to match reality (fewer `?` / `| null` when they can’t actually be null).

---

### 5.4. Document the core views and which code uses them

Quick, pragmatic step:

* [ ] At the top of each view SQL, add a comment like:

  ```sql
  -- view_item_economy
  -- Used by: data/repairEconomy.ts (getRepairEconomy, getItemEconomyForId)
  -- Purpose: Flattened item + economy JSON used by repair calculator and item details.
  ```

Helps future you know what breaks if you touch it.

---

## 6. Optional: caching & performance

You already:

* Store `version` in `app_metadata`.
* Use `dataVersion` props + `cachedFetchJson` on the client.

Checklist:

* [ ] Wrap the `cachedFetchJson` + useEffect pattern into a `useCachedJson` hook:

  ```ts
  function useCachedJson<T>(url: string, version?: string | number) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let active = true;
      setLoading(true);
      setError(null);

      cachedFetchJson<T>(url, { version: version ?? undefined })
        .then((res) => {
          if (!active) return;
          setData(res ?? null);
        })
        .catch((e) => {
          if (!active) return;
          setError(e?.message ?? "Unknown error");
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [url, version]);

    return { data, loading, error };
  }
  ```

* [ ] Use this hook in both `RecycleHelperClient` and `RepairCalculatorClient` instead of duplicating the fetch logic.

---

If you want, next step we can pick **one** of these (e.g. fully wiring `ItemPicker` into both tools, or adding those DB indexes) and walk it through with copy-paste-ready patches.
