"use client";

import { useMemo, useState } from "react";
import type { DirectYieldSource } from "@/data/yields";
import type { RecyclingSourceRow } from "@/data/recycling";
import { RarityBadge } from "@/components/ItemCard";
import { useRaidReminders } from "@/hooks/useRaidReminders";
import { useCachedJson } from "@/hooks/useCachedJson";
import { useAppVersion } from "@/hooks/useAppVersion";
import { ModulePanel } from "@/components/ModulePanel";
import { ItemPicker, type PickerItem } from "@/components/ItemPicker";
import { TwoOptionToggle } from "@/components/TwoOptionToggle";
import { SelectedItemSummary } from "@/components/SelectedItemSummary";

type HelperItem = {
  id: string;
  name: string | null;
  icon?: string | null;
  rarity?: string | null;
  item_type?: string | null;
};

type Props = {
  initialItems: HelperItem[];
  needableIds: string[]; // items that can appear as recycling outputs (component_id)
  haveableIds: string[]; // items that can appear as recycling sources (source_item_id)
  dataVersion?: string | number | null;
};

type Mode = "need" | "have";
type SortKey = "quantityDesc" | "quantityAsc" | "name" | "rarity";
type SelectionMap = Set<string>;
type BooleanOption = boolean;

// Item types we never want to show in this helper at all
const EXCLUDED_ITEM_TYPES = new Set<string>(["Blueprint", "Key"]);
const EXCLUDED_NEED_TYPES = new Set<string>(["Weapon"]);

export function RecycleHelperClient({
  initialItems,
  needableIds,
  haveableIds,
  dataVersion,
}: Props) {
  const { version: appVersion } = useAppVersion({ initialVersion: dataVersion });
  const cacheVersion = appVersion ?? dataVersion ?? undefined;
  const [mode, setMode] = useState<Mode>("need");

  // Top-level filters/selection
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("all");
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  // Result-side filters
  const [resultTypeFilter, setResultTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("quantityDesc");
  const [selectedRows, setSelectedRows] = useState<SelectionMap>(new Set());
  const [hideWeapons, setHideWeapons] = useState<BooleanOption>(true);
  const { addMany, isAdded } = useRaidReminders();

  // Sets for quick membership checks
  const needableSet = useMemo(() => new Set(needableIds), [needableIds]);
  const haveableSet = useMemo(() => new Set(haveableIds), [haveableIds]);

  // ---- Item types for the "Item type" dropdown ----
  const itemTypes = useMemo(() => {
    const set = new Set<string>();
    const activeSet = mode === "need" ? needableSet : haveableSet;

    for (const item of initialItems) {
      const type = item.item_type?.trim();
      if (!type) continue;
      if (EXCLUDED_ITEM_TYPES.has(type)) continue;
      if (!activeSet.has(item.id)) continue; // only types of items actually in recycling for this mode
      set.add(type);
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [initialItems, mode, needableSet, haveableSet]);

  // ---- Items eligible for the picker: filtered by mode + type ----
  const filteredItems = useMemo(() => {
    const activeSet = mode === "need" ? needableSet : haveableSet;

    return initialItems.filter((i) => {
      const type = i.item_type?.trim() ?? "";

      // Must have a type that is relevant for this mode
      if (!type) return false;
      if (EXCLUDED_ITEM_TYPES.has(type)) return false;
      if (mode === "need" && hideWeapons && EXCLUDED_NEED_TYPES.has(type))
        return false;
      if (!itemTypes.includes(type)) return false;

      // Item must participate in recycling for this mode
      if (!activeSet.has(i.id)) return false;

      if (itemTypeFilter !== "all" && type !== itemTypeFilter) return false;

      return true;
    });
  }, [
    initialItems,
    itemTypes,
    mode,
    itemTypeFilter,
    needableSet,
    haveableSet,
    hideWeapons,
  ]);

  // Map to PickerItem[] for the shared picker
  const pickerItems = useMemo<PickerItem[]>(
    () =>
      filteredItems.map((item) => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        rarity: item.rarity ?? undefined,
        subtitle: item.item_type ?? undefined,
      })),
    [filteredItems]
  );

  // Selected item object
  const selectedItem = selectedItemId
    ? initialItems.find((i) => i.id === selectedItemId) ?? null
    : null;

  const {
    data: needData,
    loading: needLoading,
    error: needError,
  } = useCachedJson<DirectYieldSource[]>(
    selectedItemId ? `/api/items/${selectedItemId}/sources` : null,
    {
      version: cacheVersion,
      initialData: [],
      enabled: mode === "need" && Boolean(selectedItemId),
      disableCache: true,
    }
  );

  const {
    data: haveData,
    loading: haveLoading,
    error: haveError,
  } = useCachedJson<RecyclingSourceRow[]>(
    selectedItemId ? `/api/items/${selectedItemId}/recycling` : null,
    {
      version: cacheVersion,
      initialData: [],
      enabled: mode === "have" && Boolean(selectedItemId),
      disableCache: true,
    }
  );

  const needResults = useMemo(() => needData ?? [], [needData]);
  const haveResults = useMemo(() => haveData ?? [], [haveData]);

  const loading = selectedItemId
    ? mode === "need"
      ? needLoading
      : haveLoading
    : false;
  const error = selectedItemId
    ? mode === "need"
      ? needError
      : haveError
    : null;

  function handleModeChange(next: Mode) {
    setMode(next);
    setSelectedRows(new Set());
  }

  // ---- Result-type options: only types that actually exist in the current results ----
  const resultTypes = useMemo(() => {
    const set = new Set<string>();

    if (mode === "need") {
      needResults.forEach((r) => {
        if (r.sourceType) set.add(r.sourceType);
      });
    } else {
      haveResults.forEach((r) => {
        if (r.component_type) set.add(r.component_type);
      });
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [mode, needResults, haveResults]);

  // ---- Sorting/filtering helpers ----
  function sortAndFilterNeed(rows: DirectYieldSource[]): DirectYieldSource[] {
    let out = [...rows];

    if (resultTypeFilter !== "all") {
      out = out.filter((r) => r.sourceType === resultTypeFilter);
    }

    if (hideWeapons) {
      out = out.filter((r) => (r.sourceType ?? "").toLowerCase() !== "weapon");
    }

    out.sort((a, b) => {
      switch (sortKey) {
        case "quantityDesc":
          return (b.quantity ?? 0) - (a.quantity ?? 0);
        case "quantityAsc":
          return (a.quantity ?? 0) - (b.quantity ?? 0);
        case "name":
          return (a.sourceName ?? "").localeCompare(b.sourceName ?? "");
        case "rarity":
          return (a.sourceRarity ?? "").localeCompare(b.sourceRarity ?? "");
        default:
          return 0;
      }
    });

    return out;
  }

  function sortAndFilterHave(rows: RecyclingSourceRow[]): RecyclingSourceRow[] {
    let out = [...rows];

    if (resultTypeFilter !== "all") {
      out = out.filter((r) => r.component_type === resultTypeFilter);
    }

    out.sort((a, b) => {
      switch (sortKey) {
        case "quantityDesc":
          return (b.quantity ?? 0) - (a.quantity ?? 0);
        case "quantityAsc":
          return (a.quantity ?? 0) - (b.quantity ?? 0);
        case "name":
          return (a.component_name ?? "").localeCompare(
            b.component_name ?? ""
          );
        case "rarity":
          return (a.component_rarity ?? "").localeCompare(
            b.component_rarity ?? ""
          );
        default:
          return 0;
      }
    });

    return out;
  }

  const displayNeed = sortAndFilterNeed(needResults);
  const displayHave = sortAndFilterHave(haveResults);

  function toggleRow(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAddSelected() {
    const payload =
      mode === "need"
        ? displayNeed
            .filter((row) => row.sourceItemId && selectedRows.has(row.sourceItemId))
            .map((row) => ({
              id: row.sourceItemId as string,
              name: row.sourceName ?? "Unknown item",
              icon: row.sourceIcon,
              rarity: row.sourceRarity,
              lootLocation: row.sourceType,
            }))
        : displayHave
            .filter((row) => row.component_id && selectedRows.has(row.component_id))
            .map((row) => ({
              id: row.component_id as string,
              name: row.component_name ?? "Unknown item",
              icon: row.component_icon,
              rarity: row.component_rarity,
              lootLocation: row.component_type,
            }));

    if (payload.length > 0) {
      addMany(payload);
      setSelectedRows(new Set());
    }
  }

  const hasSelection = selectedRows.size > 0;

  const modeToggle = (
  <TwoOptionToggle
    value={mode}
    onChange={(m) => handleModeChange(m as Mode)}
    optionA={{ value: "need", label: "I need this item" }}
    optionB={{ value: "have", label: "I have this item" }}
  />
);


  return (
    <ModulePanel
      title="Recycle Helper"
      headerRight={modeToggle}
      className="overflow-visible"
      bodyClassName="space-y-4"
    >
      <p className="text-base text-warm">
        Quickly answer two questions: what should I recycle to get a specific item, and what do I get from recycling something I already have.
      </p>

      {/* Picker modules */}
      <div className="grid gap-4">
        <div className="rp-card">
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-warm mb-1">
                Item type
              </label>
              <select
                value={itemTypeFilter}
                onChange={(e) => {
                  setItemTypeFilter(e.target.value);
                  setSelectedItemId("");
                }}
                className="w-full h-10 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-base text-warm focus:outline-none focus:ring-1 focus:ring-[#4fc1e9] hover:border-[#4fc1e9]"
              >
                <option value="all">All types</option>
                {itemTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-warm mb-1">
                {mode === "need"
                  ? "Item you want to obtain"
                  : "Item you want to recycle"}
              </label>

              <ItemPicker
                items={pickerItems}
                selectedId={selectedItemId || null}
                onChange={(id) => {
                  setSelectedItemId(id);
                  setSelectedRows(new Set());
                }}
                placeholder={
                  mode === "need"
                    ? "Select what you want to obtain..."
                    : "Select what you want to recycle..."
                }
                triggerClassName="h-10 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="rp-card">
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-warm mb-1">
                Filter results by item type
              </label>
              <select
                value={resultTypeFilter}
                onChange={(e) => setResultTypeFilter(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-base text-warm focus:outline-none focus:ring-1 focus:ring-[#4fc1e9] hover:border-[#4fc1e9]"
              >
                <option value="all">All types</option>
                {resultTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {resultTypes.length === 0 &&
                selectedItemId &&
                !loading &&
                !error && (
                  <p className="mt-1 text-[11px] text-warm-muted">
                    No specific result types yet for this item; you can still see
                    all results below.
                  </p>
                )}
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <div className="w-full md:flex-1">
                <label className="block text-sm font-medium text-warm mb-1">
                  Sort results
                </label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="w-full h-10 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-base text-warm focus:outline-none focus:ring-1 focus:ring-[#4fc1e9] hover:border-[#4fc1e9]"
                >
                  <option value="quantityDesc">Quantity (high to low)</option>
                  <option value="quantityAsc">Quantity (low to high)</option>
                  <option value="name">Name (A to Z)</option>
                  <option value="rarity">Rarity (A to Z)</option>
                </select>
              </div>
              {mode === "need" && (
                <label className="inline-flex items-center gap-2 h-10 px-2 text-sm text-warm md:justify-end">
                  <input
                    type="checkbox"
                    checked={hideWeapons}
                    onChange={(e) => setHideWeapons(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-[#4fc1e9] focus:ring-[#4fc1e9]"
                  />
                  Hide weapons
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected item summary */}
      {selectedItem && (
  <SelectedItemSummary
    name={selectedItem.name}
    icon={selectedItem.icon}
    rarity={selectedItem.rarity ?? undefined}
    itemType={selectedItem.item_type ?? undefined}
  />
)}


      {/* Status */}
      {loading && (
        <div className="text-xs text-warm-muted">Loading results...</div>
      )}
      {error && (
        <div className="text-xs text-red-400">
          Error loading results: {error}
        </div>
      )}

      {/* Results table */}
      {selectedItemId && !loading && !error && (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs text-warm-muted">
        Select rows and add them to Raid Reminders.
      </div>
      <button
        type="button"
        onClick={handleAddSelected}
        disabled={!hasSelection}
        className={`rounded-md px-3 py-2 text-sm font-medium border ${
          hasSelection
            ? "border-[#4fc1e9]/60 bg-[#4fc1e9]/15 text-[#4fc1e9] hover:border-[#4fc1e9]"
            : "cursor-not-allowed border-slate-800 bg-slate-900 text-warm-muted"
        }`}
      >
        Add to Raid Reminders
      </button>
    </div>

    {/* MOBILE: card layout */}
    <div className="space-y-2 md:hidden">
      {mode === "need" &&
        (displayNeed.length > 0 ? (
          displayNeed.map((row) => {
            const rowId = row.sourceItemId;
            const alreadyAdded = rowId ? isAdded(rowId) : true;
            const checked = rowId ? selectedRows.has(rowId) : false;

            return (
              <div
                key={row.sourceItemId}
                className="rounded-md border border-slate-800 bg-slate-900/80 p-3 flex items-center gap-3"
              >
                {/* checkbox */}
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    disabled={!rowId || alreadyAdded}
                    checked={checked}
                    onChange={() => rowId && toggleRow(rowId)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#4fc1e9] disabled:opacity-50"
                  />
                </div>

                {/* icon */}
                {row.sourceIcon && (
                  <img
                    src={row.sourceIcon}
                    alt={row.sourceName}
                    className="h-10 w-10 rounded border border-slate-700 bg-slate-950 object-contain flex-shrink-0"
                  />
                )}

                {/* main text */}
                <div className="flex-1 min-w-0">
                  <a
                    href={`/items/${row.sourceItemId}`}
                    className="block text-sm text-warm font-semibold truncate hover:underline"
                  >
                    {row.sourceName}
                  </a>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-warm-muted">
                    <span>{row.sourceType ?? "–"}</span>
                    <RarityBadge rarity={row.sourceRarity ?? undefined} />
                    {alreadyAdded && (
                      <span className="text-emerald-300">(added)</span>
                    )}
                  </div>
                </div>

                {/* quantity on the right */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-warm">
                    {row.quantity ?? 0}
                  </div>
                  <div className="text-[10px] text-warm-muted">Qty</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-md border border-slate-800 bg-slate-900/80 p-3 text-xs text-warm-muted text-center">
            No direct recycle sources found.
          </div>
        ))}

      {mode === "have" &&
        (displayHave.length > 0 ? (
          displayHave.map((row, idx) => {
            const rowId = row.component_id ?? `row-${idx}`;
            const hasRealId = Boolean(row.component_id);
            const alreadyAdded = hasRealId ? isAdded(rowId) : true;
            const checked = hasRealId ? selectedRows.has(rowId) : false;

            return (
              <div
                key={`${row.component_id ?? "row"}-${idx}`}
                className="rounded-md border border-slate-800 bg-slate-900/80 p-3 flex items-center gap-3"
              >
                {/* checkbox */}
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    disabled={!hasRealId || alreadyAdded}
                    checked={checked}
                    onChange={() => hasRealId && toggleRow(rowId)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#4fc1e9] disabled:opacity-50"
                  />
                </div>

                {/* icon */}
                {row.component_icon && (
                  <img
                    src={row.component_icon}
                    alt={row.component_name ?? ""}
                    className="h-10 w-10 rounded border border-slate-700 bg-slate-950 object-contain flex-shrink-0"
                  />
                )}

                {/* main text */}
                <div className="flex-1 min-w-0">
                  {row.component_id ? (
                    <a
                      href={`/items/${row.component_id}`}
                      className="block text-sm text-warm font-semibold truncate hover:underline"
                    >
                      {row.component_name ?? row.component_id}
                    </a>
                  ) : (
                    <span className="block text-sm text-warm font-semibold truncate">
                      {row.component_name ?? "Unknown item"}
                    </span>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-warm-muted">
                    <span>{row.component_type ?? "–"}</span>
                    <RarityBadge
                      rarity={row.component_rarity ?? undefined}
                    />
                    {alreadyAdded && (
                      <span className="text-emerald-300">(added)</span>
                    )}
                  </div>
                </div>

                {/* quantity on the right */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-warm">
                    {row.quantity ?? 0}
                  </div>
                  <div className="text-[10px] text-warm-muted">Qty</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-md border border-slate-800 bg-slate-900/80 p-3 text-xs text-warm-muted text-center">
            No recycling outputs found.
          </div>
        ))}
    </div>

    {/* DESKTOP: table layout */}
    <div className="hidden md:block">
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/80">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-800/90 text-xs uppercase text-warm-muted">
            <tr>
              <th className="px-3 py-2 w-12">Save</th>
              <th className="px-3 py-2 font-medium">
                {mode === "need" ? "Source item" : "Output item"}
              </th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Rarity</th>
              <th className="px-3 py-2 font-medium text-right">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {mode === "need" &&
              (displayNeed.length > 0 ? (
                displayNeed.map((row) => {
                  const rowId = row.sourceItemId;
                  const alreadyAdded = rowId ? isAdded(rowId) : true;
                  const checked = rowId ? selectedRows.has(rowId) : false;
                  return (
                    <tr
                      key={row.sourceItemId}
                      className="border-t border-slate-800/80"
                    >
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="checkbox"
                          disabled={!rowId || alreadyAdded}
                          checked={checked}
                          onChange={() => rowId && toggleRow(rowId)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#4fc1e9] disabled:opacity-50"
                        />
                      </td>
                      <td className="px-3 py-2 flex items-center gap-2">
                        {row.sourceIcon && (
                          <img
                            src={row.sourceIcon}
                            alt={row.sourceName}
                            className="h-8 w-8 rounded border border-slate-700 bg-slate-950 object-contain"
                          />
                        )}
                        <a
                          href={`/items/${row.sourceItemId}`}
                          className="hover:underline truncate"
                        >
                          {row.sourceName}
                        </a>
                        {alreadyAdded && (
                          <span className="ml-2 text-[11px] text-emerald-300">
                            (added)
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-warm">
                        {row.sourceType ?? "–"}
                      </td>
                      <td className="px-3 py-2 text-xs text-warm">
                        <RarityBadge
                          rarity={row.sourceRarity ?? undefined}
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        {row.quantity ?? 0}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-xs text-warm-muted"
                  >
                    No direct recycle sources found.
                  </td>
                </tr>
              ))}

            {mode === "have" &&
              (displayHave.length > 0 ? (
                displayHave.map((row, idx) => {
                  const rowId = row.component_id ?? `row-${idx}`;
                  const hasRealId = Boolean(row.component_id);
                  const alreadyAdded = hasRealId ? isAdded(rowId) : true;
                  const checked = hasRealId ? selectedRows.has(rowId) : false;
                  return (
                    <tr
                      key={`${row.component_id ?? "row"}-${idx}`}
                      className="border-t border-slate-800/80"
                    >
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="checkbox"
                          disabled={!hasRealId || alreadyAdded}
                          checked={checked}
                          onChange={() => hasRealId && toggleRow(rowId)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#4fc1e9] disabled:opacity-50"
                        />
                      </td>
                      <td className="px-3 py-2 flex items-center gap-2">
                        {row.component_icon && (
                          <img
                            src={row.component_icon}
                            alt={row.component_name ?? ""}
                            className="h-8 w-8 rounded border border-slate-700 bg-slate-950 object-contain"
                          />
                        )}
                        {row.component_id ? (
                          <a
                            href={`/items/${row.component_id}`}
                            className="hover:underline truncate"
                          >
                            {row.component_name ?? row.component_id}
                          </a>
                        ) : (
                          <span className="truncate">
                            {row.component_name ?? "Unknown item"}
                          </span>
                        )}
                        {alreadyAdded && (
                          <span className="ml-2 text-[11px] text-emerald-300">
                            (added)
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-warm">
                        {row.component_type ?? "–"}
                      </td>
                      <td className="px-3 py-2 text-xs text-warm">
                        <RarityBadge
                          rarity={row.component_rarity ?? undefined}
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        {row.quantity ?? 0}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-xs text-warm-muted"
                  >
                    No recycling outputs found.
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}


      {!selectedItemId && !loading && !error && (
        <div className="text-[11px] text-warm-muted">
          {mode === "need"
            ? "Pick a type, then choose what you want to obtain to see where it drops."
            : "Pick a type, then choose what you have to see what it recycles into."}
        </div>
      )}
    </ModulePanel>
  );
}
