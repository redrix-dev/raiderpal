"use client";

import { useMemo, useState } from "react";
import type {
  CanonicalItemSummary,
  RecyclingOutputRow,
  RecyclingSourceRow,
} from "@/lib/data/client";
import { RarityBadge } from "@/components/ItemCard";
import { useRaidReminders } from "@/hooks/useRaidReminders";
import { useCachedJson } from "@/hooks/useCachedJson";
import { useAppVersion } from "@/hooks/useAppVersion";
import { ModulePanel } from "@/components/ModulePanel";
import { type PickerItem } from "@/components/ItemPicker";
import { CACHE } from "@/lib/constants";
import {
  RecycleHelperFilters,
  type RecycleMode,
  type SortKey,
} from "@/components/RecycleHelperFilters";
import {
  RecycleHelperResults,
  type NeedResult,
} from "@/components/RecycleHelperResults";
import { SelectedItemSummary } from "@/components/SelectedItemSummary";
import { TwoOptionToggle } from "@/components/TwoOptionToggle";

type HelperItem = CanonicalItemSummary;

type Props = {
  initialItems: HelperItem[];
  needableIds: string[];
  haveableIds: string[];
  dataVersion?: string | number | null;
};

type SelectionMap = Set<string>;

const EXCLUDED_ITEM_TYPES = new Set<string>(["Blueprint", "Key"]);
const EXCLUDED_NEED_TYPES = new Set<string>(["Weapon"]);

function mapNeedRow(row: RecyclingSourceRow): NeedResult {
  return {
    sourceItemId: row.source_item_id ?? "",
    sourceName: row.source?.name ?? row.source_item_id ?? null,
    sourceIcon: row.source?.icon ?? null,
    sourceRarity: row.source?.rarity ?? null,
    sourceType: row.source?.item_type ?? null,
    quantity: row.quantity ?? 0,
  };
}

export function RecycleHelperClient({
  initialItems,
  needableIds,
  haveableIds,
  dataVersion,
}: Props) {
  const { version: appVersion } = useAppVersion({ initialVersion: dataVersion });
  const cacheVersion = appVersion ?? dataVersion ?? undefined;

  const [mode, setMode] = useState<RecycleMode>("need");

  // Top-level filters/selection
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("all");
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  // Result-side filters
  const [resultTypeFilter, setResultTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("quantityDesc");
  const [selectedRows, setSelectedRows] = useState<SelectionMap>(new Set());
  const [hideWeapons, setHideWeapons] = useState<boolean>(true);

  const { addMany, isAdded } = useRaidReminders();

  const needableSet = useMemo(() => new Set(needableIds), [needableIds]);
  const haveableSet = useMemo(() => new Set(haveableIds), [haveableIds]);

  function handleModeChange(next: RecycleMode) {
    setMode(next);
    setSelectedRows(new Set());
    setResultTypeFilter("all");
  }

  // ---- Item types for the "Item type" dropdown ----
  const itemTypes = useMemo(() => {
    const set = new Set<string>();
    const activeSet = mode === "need" ? needableSet : haveableSet;

    for (const item of initialItems) {
      const type = item.item_type?.trim();
      if (!type) continue;
      if (EXCLUDED_ITEM_TYPES.has(type)) continue;
      if (!activeSet.has(item.id)) continue;
      set.add(type);
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [initialItems, mode, needableSet, haveableSet]);

  // ---- Items eligible for the picker: filtered by mode + type ----
  const filteredItems = useMemo(() => {
    const activeSet = mode === "need" ? needableSet : haveableSet;

    return initialItems.filter((i) => {
      const type = i.item_type?.trim() ?? "";

      if (!type) return false;
      if (EXCLUDED_ITEM_TYPES.has(type)) return false;
      if (mode === "need" && hideWeapons && EXCLUDED_NEED_TYPES.has(type))
        return false;
      if (!itemTypes.includes(type)) return false;

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

  const pickerItems = useMemo<PickerItem[]>(
    () =>
      filteredItems.map((item) => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        rarity: item.rarity ?? undefined,
        itemType: item.item_type ?? undefined,
        lootArea: item.loot_area ?? undefined,
      })),
    [filteredItems]
  );

  const selectedItem = selectedItemId
    ? initialItems.find((i) => i.id === selectedItemId) ?? null
    : null;

  const { data: needData, loading: needLoading, error: needError } =
    useCachedJson<RecyclingSourceRow[]>(
      selectedItemId ? `/api/items/${selectedItemId}/sources` : null,
      {
        version: cacheVersion,
        enabled: mode === "need" && Boolean(selectedItemId),
        ttlMs: CACHE.MODAL_TTL_MS,
      }
    );

  const { data: haveData, loading: haveLoading, error: haveError } =
    useCachedJson<RecyclingOutputRow[]>(
      selectedItemId ? `/api/items/${selectedItemId}/recycling` : null,
      {
        version: cacheVersion,
        enabled: mode === "have" && Boolean(selectedItemId),
        ttlMs: CACHE.MODAL_TTL_MS,
      }
    );

  const needResults = useMemo<NeedResult[]>(
    () => (needData ?? []).map(mapNeedRow),
    [needData]
  );
  const haveResults = useMemo<RecyclingOutputRow[]>(() => haveData ?? [], [haveData]);

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

  // ---- Result-type options: only types that actually exist in the current results ----
  const resultTypes = useMemo(() => {
    const set = new Set<string>();

    if (mode === "need") {
      needResults.forEach((r) => {
        if (r.sourceType) set.add(r.sourceType);
      });
    } else {
      haveResults.forEach((r) => {
        const type = r.component?.item_type;
        if (type) set.add(type);
      });
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [mode, needResults, haveResults]);

  function sortAndFilterNeed(rows: NeedResult[]): NeedResult[] {
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

  function sortAndFilterHave(rows: RecyclingOutputRow[]): RecyclingOutputRow[] {
    let out = [...rows];

    if (resultTypeFilter !== "all") {
      out = out.filter((r) => r.component?.item_type === resultTypeFilter);
    }

    out.sort((a, b) => {
      switch (sortKey) {
        case "quantityDesc":
          return (b.quantity ?? 0) - (a.quantity ?? 0);
        case "quantityAsc":
          return (a.quantity ?? 0) - (b.quantity ?? 0);
        case "name":
          return (a.component?.name ?? "").localeCompare(b.component?.name ?? "");
        case "rarity":
          return (a.component?.rarity ?? "").localeCompare(b.component?.rarity ?? "");
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
              name: row.component?.name ?? "Unknown item",
              icon: row.component?.icon ?? null,
              rarity: row.component?.rarity ?? null,
              lootLocation: row.component?.item_type ?? null,
            }));

    if (payload.length > 0) {
      addMany(payload);
      setSelectedRows(new Set());
    }
  }

  const modeToggle = (
    <TwoOptionToggle
      value={mode}
      onChange={(m) => handleModeChange(m as RecycleMode)}
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
      <p className="text-base text-primary">
        Quickly answer two questions: what should I recycle to get a specific item, and what do I get from recycling something I already have.
      </p>

      <RecycleHelperFilters
        mode={mode}
        onModeChange={(m) => {
          handleModeChange(m);
          setSelectedRows(new Set());
        }}
        itemTypes={itemTypes}
        itemTypeFilter={itemTypeFilter}
        onItemTypeFilterChange={(value) => {
          setItemTypeFilter(value);
          setSelectedItemId("");
        }}
        pickerItems={pickerItems}
        selectedItemId={selectedItemId}
        onSelectedItemChange={(id) => {
          setSelectedItemId(id);
          setSelectedRows(new Set());
        }}
        resultTypes={resultTypes}
        resultTypeFilter={resultTypeFilter}
        onResultTypeFilterChange={setResultTypeFilter}
        sortKey={sortKey}
        onSortKeyChange={setSortKey}
        hideWeapons={hideWeapons}
        onHideWeaponsChange={setHideWeapons}
      />

      {selectedItem && (
        <SelectedItemSummary
          name={selectedItem.name}
          icon={selectedItem.icon}
          rarity={selectedItem.rarity ?? undefined}
          itemType={selectedItem.item_type ?? undefined}
        />
      )}

      <RecycleHelperResults
        mode={mode}
        selectedItemId={selectedItemId}
        loading={loading}
        error={error}
        displayNeed={displayNeed}
        displayHave={displayHave}
        selectedRows={selectedRows}
        onToggleRow={toggleRow}
        isAdded={isAdded}
        onAddSelected={handleAddSelected}
      />
    </ModulePanel>
  );
}
