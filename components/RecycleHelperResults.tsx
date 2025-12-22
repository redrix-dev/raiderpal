"use client";

import Image from "next/image";
import { RarityBadge } from "@/components/ItemCard";
import type { RecyclingOutputRow } from "@/lib/data/client";

export type RecycleMode = "need" | "have";

export type NeedResult = {
  sourceItemId: string;
  sourceName: string | null;
  sourceIcon: string | null;
  sourceRarity: string | null;
  sourceType: string | null;
  quantity: number;
};

type Props = {
  mode: RecycleMode;
  selectedItemId: string;

  loading: boolean;
  error: string | null;

  displayNeed: NeedResult[];
  displayHave: RecyclingOutputRow[];

  selectedRows: Set<string>;
  onToggleRow: (id: string) => void;

  isAdded: (id: string) => boolean;

  onAddSelected: () => void;
};

export function RecycleHelperResults(props: Props) {
  const {
    mode,
    selectedItemId,
    loading,
    error,
    displayNeed,
    displayHave,
    selectedRows,
    onToggleRow,
    isAdded,
    onAddSelected,
  } = props;

  const hasSelection = selectedRows.size > 0;

  if (!selectedItemId && !loading && !error) {
    return (
      <div className="text-[11px] text-muted">
        {mode === "need"
          ? "Pick a type, then choose what you want to obtain to see where it drops."
          : "Pick a type, then choose what you have to see what it recycles into."}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-3 w-40 rounded bg-white/10" />
        <div className="h-16 w-full rounded border border-white/5 bg-black/20" />
        <div className="h-16 w-full rounded border border-white/5 bg-black/20" />
      </div>
    );
  }

  if (error) {
    return <div className="text-xs text-red-400">Error loading results: {error}</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted">
          Select rows and add them to Raid Reminders.
        </div>
        <button
          type="button"
          onClick={onAddSelected}
          disabled={!hasSelection}
          className={`rounded-md px-3 py-2 text-sm font-medium border ${
            hasSelection
              ? "border-brand-cyan/60 bg-brand-cyan/15 text-brand-cyan hover:border-brand-cyan"
              : "cursor-not-allowed border-border-strong bg-surface-base text-muted"
          }`}
        >
          Add to Raid Reminders
        </button>
      </div>

      {/* MOBILE */}
      <div className="space-y-2 md:hidden">
        {mode === "need" ? (
          displayNeed.length > 0 ? (
            displayNeed.map((row) => {
              const rowId = row.sourceItemId;
              const alreadyAdded = rowId ? isAdded(rowId) : true;
              const checked = rowId ? selectedRows.has(rowId) : false;

              return (
                <div
                  key={rowId}
                  className="rounded-md border border-border-subtle bg-surface-card p-3 flex items-center gap-3"
                >
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      disabled={!rowId || alreadyAdded}
                      checked={checked}
                      onChange={() => rowId && onToggleRow(rowId)}
                      className="h-4 w-4 rounded border-border-subtle bg-surface-base text-brand-cyan disabled:opacity-50"
                    />
                  </div>

                  {row.sourceIcon && (
                    <Image
                      src={row.sourceIcon}
                      alt={row.sourceName ?? ""}
                      width={40}
                      height={40}
                      sizes="40px"
                      loading="lazy"
                      className="h-10 w-10 rounded border border-border-subtle bg-surface-base object-contain flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <a
                      href={`/items/${rowId}`}
                      className="block text-sm text-primary font-semibold truncate hover:underline"
                    >
                      {row.sourceName}
                    </a>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      <span>{row.sourceType ?? "Unknown"}</span>
                      <RarityBadge rarity={row.sourceRarity ?? undefined} />
                      {alreadyAdded && <span className="text-emerald-300">(added)</span>}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-semibold text-primary">
                      {row.quantity ?? 0}
                    </div>
                    <div className="text-[10px] text-muted">Qty</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-md border border-border-strong bg-surface-base/80 p-3 text-xs text-muted text-center">
              No direct recycle sources found.
            </div>
          )
        ) : displayHave.length > 0 ? (
          displayHave.map((row, idx) => {
            const rowId = row.component_id ?? `row-${idx}`;
            const hasRealId = Boolean(row.component_id);
            const alreadyAdded = hasRealId ? isAdded(rowId) : true;
            const checked = hasRealId ? selectedRows.has(rowId) : false;

            return (
              <div
                key={`${row.component_id ?? "row"}-${idx}`}
                className="rounded-md border border-border-subtle bg-surface-card p-3 flex items-center gap-3"
              >
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    disabled={!hasRealId || alreadyAdded}
                    checked={checked}
                    onChange={() => hasRealId && onToggleRow(rowId)}
                    className="h-4 w-4 rounded border-border-subtle bg-surface-base text-brand-cyan disabled:opacity-50"
                  />
                </div>

                {row.component?.icon && (
                  <Image
                    src={row.component.icon}
                    alt={row.component?.name ?? ""}
                    width={40}
                    height={40}
                    sizes="40px"
                    loading="lazy"
                    className="h-10 w-10 rounded border border-border-subtle bg-surface-base object-contain flex-shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  {row.component_id ? (
                    <a
                      href={`/items/${row.component_id}`}
                      className="block text-sm text-primary font-semibold truncate hover:underline"
                    >
                      {row.component?.name ?? row.component_id}
                    </a>
                  ) : (
                    <span className="block text-sm text-primary font-semibold truncate">
                      {row.component?.name ?? "Unknown item"}
                    </span>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                    <span>{row.component?.item_type ?? "Unknown"}</span>
                    <RarityBadge rarity={row.component?.rarity ?? undefined} />
                    {alreadyAdded && <span className="text-emerald-300">(added)</span>}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-primary">
                    {row.quantity ?? 0}
                  </div>
                  <div className="text-[10px] text-muted">Qty</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-md border border-border-strong bg-surface-base/80 p-3 text-xs text-muted text-center">
            No recycling outputs found.
          </div>
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-base text-xs uppercase text-muted">
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
              {mode === "need" ? (
                displayNeed.length > 0 ? (
                  displayNeed.map((row) => {
                    const rowId = row.sourceItemId;
                    const alreadyAdded = rowId ? isAdded(rowId) : true;
                    const checked = rowId ? selectedRows.has(rowId) : false;

                    return (
                      <tr key={rowId} className="border-t border-border-subtle">
                        <td className="px-3 py-2 align-middle">
                          <input
                            type="checkbox"
                            disabled={!rowId || alreadyAdded}
                            checked={checked}
                            onChange={() => rowId && onToggleRow(rowId)}
                            className="h-4 w-4 rounded border-border-subtle bg-surface-base text-brand-cyan disabled:opacity-50"
                          />
                        </td>

                        <td className="px-3 py-2 flex items-center gap-2">
                          {row.sourceIcon && (
                            <Image
                              src={row.sourceIcon}
                              alt={row.sourceName ?? ""}
                              width={32}
                              height={32}
                              sizes="32px"
                              loading="lazy"
                              className="h-8 w-8 rounded border border-border-subtle bg-surface-base object-contain"
                            />
                          )}
                          <a
                            href={`/items/${rowId}`}
                            className="hover:underline truncate text-primary"
                          >
                            {row.sourceName}
                          </a>
                          {alreadyAdded && (
                            <span className="ml-2 text-[11px] text-emerald-300">
                              (added)
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-2 text-xs text-muted">
                          {row.sourceType ?? "Unknown"}
                        </td>

                        <td className="px-3 py-2 text-xs text-muted">
                          <RarityBadge rarity={row.sourceRarity ?? undefined} />
                        </td>

                        <td className="px-3 py-2 text-right text-primary">
                          {row.quantity ?? 0}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-xs text-muted">
                      No direct recycle sources found.
                    </td>
                  </tr>
                )
              ) : displayHave.length > 0 ? (
                displayHave.map((row, idx) => {
                  const rowId = row.component_id ?? `row-${idx}`;
                  const hasRealId = Boolean(row.component_id);
                  const alreadyAdded = hasRealId ? isAdded(rowId) : true;
                  const checked = hasRealId ? selectedRows.has(rowId) : false;

                  return (
                    <tr
                      key={`${row.component_id ?? "row"}-${idx}`}
                      className="border-t border-border-subtle"
                    >
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="checkbox"
                          disabled={!hasRealId || alreadyAdded}
                          checked={checked}
                          onChange={() => hasRealId && onToggleRow(rowId)}
                          className="h-4 w-4 rounded border-border-subtle bg-surface-base text-brand-cyan disabled:opacity-50"
                        />
                      </td>

                      <td className="px-3 py-2 flex items-center gap-2">
                        {row.component?.icon && (
                          <Image
                            src={row.component.icon}
                            alt={row.component?.name ?? ""}
                            width={32}
                            height={32}
                            sizes="32px"
                            loading="lazy"
                            className="h-8 w-8 rounded border border-border-subtle bg-surface-base object-contain"
                          />
                        )}
                        {row.component_id ? (
                          <a
                            href={`/items/${row.component_id}`}
                            className="hover:underline truncate text-primary"
                          >
                            {row.component?.name ?? row.component_id}
                          </a>
                        ) : (
                          <span className="truncate text-primary">
                            {row.component?.name ?? "Unknown item"}
                          </span>
                        )}
                        {alreadyAdded && (
                          <span className="ml-2 text-[11px] text-emerald-300">
                            (added)
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2 text-xs text-muted">
                        {row.component?.item_type ?? "Unknown"}
                      </td>

                      <td className="px-3 py-2 text-xs text-muted">
                        <RarityBadge rarity={row.component?.rarity ?? undefined} />
                      </td>

                      <td className="px-3 py-2 text-right text-primary">
                        {row.quantity ?? 0}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-xs text-muted">
                    No recycling outputs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
