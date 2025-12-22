"use client";

import { Card } from "@/components/ui/Card";
import { ItemPicker, type PickerItem } from "@/components/ItemPicker";
import { TwoOptionToggle } from "@/components/TwoOptionToggle";

export type RecycleMode = "need" | "have";
export type SortKey = "quantityDesc" | "quantityAsc" | "name" | "rarity";

type Props = {
  mode: RecycleMode;
  onModeChange: (mode: RecycleMode) => void;

  itemTypes: string[];
  itemTypeFilter: string;
  onItemTypeFilterChange: (value: string) => void;

  pickerItems: PickerItem[];
  selectedItemId: string;
  onSelectedItemChange: (id: string) => void;

  resultTypes: string[];
  resultTypeFilter: string;
  onResultTypeFilterChange: (value: string) => void;

  sortKey: SortKey;
  onSortKeyChange: (value: SortKey) => void;

  hideWeapons: boolean;
  onHideWeaponsChange: (value: boolean) => void;
};

export function RecycleHelperFilters(props: Props) {
  const {
    mode,
    onModeChange,

    itemTypes,
    itemTypeFilter,
    onItemTypeFilterChange,

    pickerItems,
    selectedItemId,
    onSelectedItemChange,

    resultTypes,
    resultTypeFilter,
    onResultTypeFilterChange,

    sortKey,
    onSortKeyChange,

    hideWeapons,
    onHideWeaponsChange,
  } = props;

  const modeToggle = (
    <TwoOptionToggle
      value={mode}
      onChange={(m) => onModeChange(m as "need" | "have")}
      optionA={{ value: "need", label: "I need this item" }}
      optionB={{ value: "have", label: "I have this item" }}
    />
  );

  return (
    <div className="space-y-4">
      {/* Mode toggle lives in headerRight in the parent; this is here if you ever want it inline. */}
      <div className="hidden">{modeToggle}</div>

      {/* Picker modules */}
      <div className="grid gap-4">
        <Card>
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-primary mb-1">
                Item type
              </label>
              <select
                value={itemTypeFilter}
                onChange={(e) => onItemTypeFilterChange(e.target.value)}
                className="w-full h-10 rounded-md border border-border-strong bg-surface-base px-3 py-2 text-base text-primary focus:outline-none focus:ring-1 focus:ring-brand-cyan hover:border-brand-cyan"
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
              <label className="block text-sm font-medium text-primary mb-1">
                {mode === "need"
                  ? "Item you want to obtain"
                  : "Item you want to recycle"}
              </label>

              <ItemPicker
                items={pickerItems}
                selectedId={selectedItemId || null}
                onChange={onSelectedItemChange}
                placeholder={
                  mode === "need"
                    ? "Select what you want to obtain..."
                    : "Select what you want to recycle..."
                }
                triggerClassName="h-10 text-sm"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-primary mb-1">
                Filter results by item type
              </label>
              <select
                value={resultTypeFilter}
                onChange={(e) => onResultTypeFilterChange(e.target.value)}
                className="w-full h-10 rounded-md border border-border-strong bg-surface-base px-3 py-2 text-base text-primary focus:outline-none focus:ring-1 focus:ring-brand-cyan hover:border-brand-cyan"
              >
                <option value="all">All types</option>
                {resultTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {resultTypes.length === 0 && selectedItemId && (
                <p className="mt-1 text-[11px] text-muted">
                  No specific result types yet for this item; you can still see
                  all results below.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <div className="w-full md:flex-1">
                <label className="block text-sm font-medium text-primary mb-1">
                  Sort results
                </label>
                <select
                  value={sortKey}
                  onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
                  className="w-full h-10 rounded-md border border-border-strong bg-surface-base px-3 py-2 text-base text-primary focus:outline-none focus:ring-1 focus:ring-brand-cyan hover:border-brand-cyan"
                >
                  <option value="quantityDesc">Quantity (high to low)</option>
                  <option value="quantityAsc">Quantity (low to high)</option>
                  <option value="name">Name (A to Z)</option>
                  <option value="rarity">Rarity (A to Z)</option>
                </select>
              </div>

              {mode === "need" && (
                <label className="inline-flex items-center gap-2 h-10 px-2 text-sm text-primary md:justify-end">
                  <input
                    type="checkbox"
                    checked={hideWeapons}
                    onChange={(e) => onHideWeaponsChange(e.target.checked)}
                    className="h-5 w-5 rounded border-border-subtle bg-surface-base text-brand-cyan focus:ring-brand-cyan"
                  />
                  Hide weapons
                </label>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
