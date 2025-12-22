"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RarityBadge, rarityClasses } from "@/components/ItemCard";
import { cn } from "@/lib/cn";

export type PickerItem = {
  id: string;
  name: string | null;
  icon?: string | null;
  rarity?: string | null;
  itemType?: string | null;
  lootArea?: string | null;
  subtitle?: string | null;
};

type ItemPickerProps = {
  items: PickerItem[];
  selectedId: string | null;
  onChange: (id: string) => void;
  placeholder?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
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
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const dropdownId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => (i.name ?? "").toLowerCase().includes(q));
  }, [items, query]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when opened
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    
    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  // Focus management
  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpen(false);
        setQuery("");
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery("");
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const dropdown = open && mounted && (
    <div
      ref={dropdownRef}
      id={dropdownId}
      className={cn(
        "fixed z-50 rounded-md border border-border-strong bg-surface-panel shadow-2xl",
        dropdownClassName
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
    >
      {/* Search input */}
      <div className="border-b border-border-strong p-2 bg-surface-panel rounded-t-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name..."
          ref={searchRef}
          className="w-full rounded-md border border-border-subtle bg-surface-card px-2 py-1 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand-cyan"
        />
      </div>

      {/* Scrollable list - fixed height */}
      <div className="max-h-[320px] overflow-y-auto bg-surface-panel">
        {filtered.length === 0 ? (
          <div className="p-3 text-xs text-muted">
            No items match your filters.
          </div>
        ) : (
          <ul className="text-xs">
            {filtered.map((item) => (
              <li key={item.id} className="px-2 py-1">
                <button
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  role="option"
                  aria-selected={item.id === selectedId}
                  className={cn(
                    "group w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:border-brand-cyan/70 hover:bg-white/5",
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
                      className="h-[52px] w-[52px] rounded border border-border-subtle bg-surface-base object-contain flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-condensed font-semibold text-primary">
                        {item.name}
                      </span>
                      {item.rarity && <RarityBadge rarity={item.rarity} />}
                    </div>

                    {(item.itemType || item.lootArea || item.subtitle) && (
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted font-medium">
                        {item.itemType && (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                            {item.itemType}
                          </span>
                        )}
                        {item.lootArea && (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-brand-cyan" />
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
  );

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
          "w-full h-10 rounded-md border px-3 py-2 text-base text-primary flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-brand-cyan hover:border-brand-cyan transition-colors",
          selected
            ? rarityClasses(selected.rarity)
            : "border-border-strong bg-surface-base",
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
              className="h-[52px] w-[52px] rounded border border-border-subtle bg-surface-base object-contain flex-shrink-0"
            />
          )}
          <span className={cn("truncate", selected ? "text-primary" : "text-muted")}>
            {selected?.name ?? placeholder}
          </span>
        </span>
        <span className="ml-2 text-xs text-muted">{open ? "▲" : "▼"}</span>
      </button>

      {mounted && typeof document !== 'undefined' && dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
