"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { RarityBadge, rarityClasses } from "@/components/ItemCard";
import { cn } from "@/lib/cn";

export type PickerItem = {
  id: string;
  name: string | null;
  icon?: string | null;
  rarity?: string | null;
  itemType?: string | null;
  lootArea?: string | null;
  subtitle?: string | null; // e.g. "Max durability: 100"
};

type ItemPickerProps = {
  items: PickerItem[];
  selectedId: string | null;
  onChange: (id: string) => void;
  placeholder?: string;
  triggerClassName?: string;   // controls height / text size
  dropdownClassName?: string;  // optional override for dropdown width/position
};

export function ItemPicker({
  items,
  selectedId,
  onChange,
  placeholder = "Select an item...",
  triggerClassName,
  dropdownClassName,
}: ItemPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const wasOpenRef = useRef(false);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      (i.name ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    } else if (wasOpenRef.current) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={dropdownId}
        ref={triggerRef}
        className={cn(
          "w-full h-10 2xl:[.ui-compact_&]:h-14 rounded-md border px-3 py-2 text-base 2xl:[.ui-compact_&]:text-sm text-text-primary flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-brand-cyan hover:border-brand-cyan",
          selected ? rarityClasses(selected.rarity) : "border-border-strong bg-surface-base",
          triggerClassName
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.icon && (
            <Image
              src={selected.icon}
              alt={selected.name ?? "Selected item"}
              width={52}
              height={52}
              sizes="52px"
              loading="lazy"
              className="h-[52px] w-[52px] 2xl:[.ui-compact_&]:h-11 2xl:[.ui-compact_&]:w-11 rounded border border-border-subtle bg-surface-base object-contain"
            />
          )}
          <span
            className={cn(
              "truncate",
              selected ? "text-text-primary" : "text-text-muted"
            )}
          >
            {selected?.name ?? placeholder}
          </span>
        </span>
        <span className="ml-2 text-xs text-text-muted">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-40 left-0 top-full mt-1 w-full rounded-md border border-border-strong bg-surface-panel shadow-lg text-xs 2xl:[.ui-compact_&]:text-[11px] max-h-[70vh] overflow-auto",
            dropdownClassName
          )}
        >
          <div className="border-b border-border-strong p-2 bg-surface-panel/80 rounded-t-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name..."
              ref={searchRef}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                }
              }}
              className="w-full rounded-md border border-border-subtle bg-surface-card px-2 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-cyan"
            />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-xs text-text-muted">
                No items match your filters.
              </div>
            ) : (
              <ul className="text-xs 2xl:[.ui-compact_&]:text-[11px]">
                {filtered.map((item) => (
                  <li key={item.id} className="px-2 py-1">
                    <button
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      role="option"
                      aria-selected={item.id === selectedId}
                      className={cn(
                        "group w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm 2xl:[.ui-compact_&]:text-sm transition-colors hover:border-brand-cyan/70 hover:bg-surface-card",
                        rarityClasses(item.rarity)
                      )}
                    >
                      {item.icon && (
                        <Image
                          src={item.icon}
                          alt={item.name ?? "icon"}
                          width={52}
                          height={52}
                          sizes="52px"
                          loading="lazy"
                          className="h-[52px] w-[52px] 2xl:[.ui-compact_&]:h-11 2xl:[.ui-compact_&]:w-11 rounded border border-border-subtle bg-surface-base object-contain"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-condensed font-semibold text-text-primary">
                            {item.name}
                          </span>
                          {item.rarity && (
                            <RarityBadge rarity={item.rarity} />
                          )}
                        </div>
                        {(item.itemType || item.lootArea || item.subtitle) && (
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] 2xl:[.ui-compact_&]:text-[10px] text-text-muted font-medium">
                            {item.itemType && (
                              <span className="inline-flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-slate-500" />
                                {item.itemType}
                              </span>
                            )}
                            {item.lootArea && (
                              <span className="inline-flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-[#4fc1e9]" />
                                {item.lootArea}
                              </span>
                            )}
                            {item.subtitle && (
                              <span className="inline-flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-slate-500/80" />
                                {item.subtitle}
                              </span>
                            )}
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
  );
}
