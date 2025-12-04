"use client";

import { useEffect, useMemo, useState } from "react";
import type { DirectYieldSource } from "@/data/yields";
import type { RecyclingSourceRow } from "@/data/recycling";
import { RarityBadge } from "@/components/ItemCard";
import { cachedFetchJson } from "@/lib/clientCache";
import { useRaidReminders } from "@/hooks/useRaidReminders";

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
  const [mode, setMode] = useState<Mode>("need");

  // Top-level filters/selection
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("all");
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  // Dropdown UI state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");

  // Results
  const [needResults, setNeedResults] = useState<DirectYieldSource[]>([]);
  const [haveResults, setHaveResults] = useState<RecyclingSourceRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // ---- Items for the picker: filtered by mode + type + name ----
  const filteredItems = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
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

      if (!q) return true;
      const n = i.name ?? "";
      return n.toLowerCase().includes(q);
    });
  }, [
    initialItems,
    itemTypes,
    mode,
    itemTypeFilter,
    pickerQuery,
    needableSet,
    haveableSet,
    hideWeapons,
  ]);

  // Selected item object
  const selectedItem = selectedItemId
    ? initialItems.find((i) => i.id === selectedItemId) ?? null
    : null;

  // ---- Fetch data when item or mode changes ----
  useEffect(() => {
    if (!selectedItemId) {
      setNeedResults([]);
      setHaveResults([]);
      setError(null);
      setSelectedRows(new Set());
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        if (mode === "need") {
          const data = await cachedFetchJson<DirectYieldSource[]>(
            `/items/${selectedItemId}/sources`,
            { version: dataVersion ?? undefined }
          );
          setNeedResults(data ?? []);
        } else {
          const data = await cachedFetchJson<RecyclingSourceRow[]>(
            `/items/${selectedItemId}/recycling`,
            { version: dataVersion ?? undefined }
          );
          setHaveResults(data ?? []);
        }
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
        setNeedResults([]);
        setHaveResults([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [selectedItemId, mode, dataVersion]);

  function handleModeChange(next: Mode) {
    setMode(next);
    setSelectedRows(new Set());
  }

  function handleSelectItem(item: HelperItem) {
    setSelectedItemId(item.id);
    setPickerOpen(false);
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

  return (
    <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
      {/* Mode toggle header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="text-sm text-slate-200 font-medium">Recycle Helper</div>
        <div className="inline-flex w-full sm:w-auto rounded-md border border-slate-700 bg-slate-900 p-1 text-xs">
          <button
            type="button"
            onClick={() => handleModeChange("need")}
            className={
              "flex-1 px-3 py-1 rounded " +
              (mode === "need"
                ? "bg-sky-600 text-white"
                : "text-gray-200 hover:bg-slate-800")
            }
          >
            I need this item
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("have")}
            className={
              "flex-1 px-3 py-1 rounded " +
              (mode === "have"
                ? "bg-sky-600 text-white"
                : "text-gray-200 hover:bg-slate-800")
            }
          >
            I have this item
          </button>
        </div>
      </div>

      {/* Picker modules */}
      <div className="grid gap-4">
        <div className="rounded-md border border-slate-800 bg-slate-900/80 p-3">
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Item type
              </label>
              <select
                value={itemTypeFilter}
                onChange={(e) => {
                  setItemTypeFilter(e.target.value);
                  setSelectedItemId("");
                  setPickerQuery("");
                }}
                className="w-full h-10 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
              <label className="block text-xs font-medium text-gray-400 mb-1">
                {mode === "need"
                  ? "Item you want to obtain"
                  : "Item you want to recycle"}
              </label>

              {/* Item selector with absolute dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPickerOpen((open) => !open)}
                  className="w-full h-10 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-gray-100 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <span className="truncate">
                    {selectedItem?.name ?? "Select an item..."}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {pickerOpen ? "^" : "v"}
                  </span>
                </button>

                {pickerOpen && (
                  <div className="absolute z-20 left-0 top-full mt-1 w-full rounded-md border border-slate-800 bg-slate-950/95 shadow-lg text-xs">
                    <div className="border-b border-slate-800 p-2">
                      <input
                        type="text"
                        value={pickerQuery}
                        onChange={(e) => setPickerQuery(e.target.value)}
                        placeholder="Filter by name..."
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {filteredItems.length === 0 ? (
                        <div className="p-3 text-xs text-gray-500">
                          No items match your filters.
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-800 text-xs">
                          {filteredItems.map((item) => (
                            <li key={item.id}>
                              <button
                                type="button"
                                onClick={() => handleSelectItem(item)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-900"
                              >
                                {item.icon && (
                                  <img
                                    src={item.icon}
                                    alt={item.name ?? "icon"}
                                    className="h-6 w-6 rounded border border-slate-700 bg-slate-950 object-contain"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-gray-100">
                                      {item.name}
                                    </span>
                                    <RarityBadge
                                      rarity={item.rarity ?? undefined}
                                    />
                                  </div>
                                  {item.item_type && (
                                    <div className="text-[10px] text-gray-500">
                                      {item.item_type}
                                    </div>
                                  )}
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-900/80 p-3">
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Filter results by item type
              </label>
              <select
                value={resultTypeFilter}
                onChange={(e) => setResultTypeFilter(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
                  <p className="mt-1 text-[11px] text-gray-500">
                    No specific result types yet for this item; you can still see
                    all results below.
                  </p>
                )}
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <div className="w-full md:flex-1">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Sort results
                </label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="w-full h-10 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="quantityDesc">Quantity (high to low)</option>
                  <option value="quantityAsc">Quantity (low to high)</option>
                  <option value="name">Name (A to Z)</option>
                  <option value="rarity">Rarity (A to Z)</option>
                </select>
              </div>
              {mode === "need" && (
                <label className="inline-flex items-center gap-2 h-10 px-2 text-sm text-gray-200 md:justify-end">
                  <input
                    type="checkbox"
                    checked={hideWeapons}
                    onChange={(e) => setHideWeapons(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
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
        <div className="rounded-md border border-slate-800 bg-slate-900/80 p-3 text-sm flex items-center gap-3">
          {selectedItem.icon && (
            <img
              src={selectedItem.icon}
              alt={selectedItem.name ?? ""}
              className="h-10 w-10 rounded border border-slate-700 bg-slate-950 object-contain"
            />
          )}
          <div>
            <div className="font-medium text-gray-100">
              {selectedItem.name ?? "Unnamed item"}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
              {selectedItem.item_type && (
                <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5">
                  {selectedItem.item_type}
                </span>
              )}
              <RarityBadge rarity={selectedItem.rarity ?? undefined} />
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      {loading && (
        <div className="text-xs text-gray-400">Loading results...</div>
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
            <div className="text-xs text-gray-400">
              Select rows and add them to Raid Reminders.
            </div>
            <button
              type="button"
              onClick={handleAddSelected}
              disabled={!hasSelection}
              className={`rounded-md px-3 py-2 text-sm font-medium border ${
                hasSelection
                  ? "border-sky-600/60 bg-sky-900/40 text-sky-100 hover:border-sky-500"
                  : "cursor-not-allowed border-slate-800 bg-slate-900 text-slate-600"
              }`}
            >
              Add to Raid Reminders
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/80">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-800/90 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-3 py-2 w-12">Save</th>
                  <th className="px-3 py-2 font-medium">
                    {mode === "need" ? "Source item" : "Output item"}
                  </th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Rarity</th>
                  <th className="px-3 py-2 font-medium text-right">
                    Quantity
                  </th>
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
                              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 disabled:opacity-50"
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
                          <td className="px-3 py-2 text-xs text-gray-300">
                            {row.sourceType ?? "–"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-300">
                            <RarityBadge rarity={row.sourceRarity ?? undefined} />
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
                        className="px-3 py-4 text-center text-xs text-gray-500"
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
                              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 disabled:opacity-50"
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
                          <td className="px-3 py-2 text-xs text-gray-300">
                            {row.component_type ?? "–"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-300">
                            <RarityBadge rarity={row.component_rarity ?? undefined} />
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
                        className="px-3 py-4 text-center text-xs text-gray-500"
                      >
                        No recycling outputs found.
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedItemId && !loading && !error && (
        <div className="text-[11px] text-gray-500">
          {mode === "need"
            ? "Pick a type, then choose what you want to obtain to see where it drops."
            : "Pick a type, then choose what you have to see what it recycles into."}
        </div>
      )}
    </div>
  );
}
