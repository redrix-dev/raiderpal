"use client";

import { useMemo, useState } from "react";
import { useFloating, useInteractions, useClick, useDismiss, FloatingPortal, flip, offset, autoUpdate, size } from '@floating-ui/react';
import { ItemRowCard } from "@/components/rp/ItemRowCard";
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

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [
      offset(4),
      flip(),
      size({
        apply({ elements, availableHeight }) {
          const referenceWidth = elements.reference.getBoundingClientRect().width;
          const safeAvailable = Math.max(0, Math.floor(availableHeight ?? 0));
          const desiredMax = Math.min(360, Math.floor(safeAvailable * 0.6));
          const maxHeight = Math.min(
            safeAvailable,
            Math.max(220, desiredMax)
          );
          const listMaxHeight = Math.max(0, maxHeight - 56);

          elements.floating.style.width = `${referenceWidth}px`;
          elements.floating.style.maxHeight = `${maxHeight}px`;
          elements.floating.style.setProperty(
            "--picker-list-max-height",
            `${listMaxHeight}px`
          );
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const selected = items.find((i) => i.id === selectedId) ?? null;
  const hasSelection = Boolean(selected);
  const triggerTone = hasSelection ? "rarity" : "neutral";

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

  const dropdown = open && (
    <div
      className={cn(
        "z-50 rounded-md border border-border-strong bg-surface-panel shadow-2xl overflow-hidden",
        dropdownClassName
      )}
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
    >
      {/* Search input */}
      <div className="border-b border-border-strong p-2 bg-surface-panel rounded-t-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name..."
          className="w-full rounded-md border border-border-subtle bg-surface-card px-2 py-1 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand-cyan"
        />
      </div>

      {/* Scrollable list */}
      <div className="max-h-[var(--picker-list-max-height,312px)] overflow-y-auto bg-surface-panel">
        {filtered.length === 0 ? (
          <div className="p-3 text-xs text-muted">
            No items match your filters.
          </div>
        ) : (
          <ul className="text-xs">
            {filtered.map((item) => (
              <li key={item.id} className="px-2 py-1">
                <ItemRowCard
                  as="button"
                  onClick={() => handleSelect(item.id)}
                  role="option"
                  aria-selected={item.id === selectedId}
                  title={item.name ?? "Unknown item"}
                  icon={item.icon}
                  rarity={item.rarity}
                  iconAlt={item.name ?? "icon"}
                  variant="dropdown"
                  tone="rarity"
                  interactive
                  meta={
                    item.itemType || item.lootArea || item.subtitle ? (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {item.itemType && (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-border-strong" />
                            {item.itemType}
                          </span>
                        )}
                        {item.lootArea && (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-brand-cyan" />
                            {item.lootArea}
                          </span>
                        )}
                        {item.subtitle && (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-border-subtle" />
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    ) : null
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <ItemRowCard
        as="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        title={selected?.name ?? placeholder}
        titleClassName={hasSelection ? undefined : "text-muted font-medium"}
        icon={selected?.icon ?? null}
        iconAlt={selected?.name ?? "Selected item"}
        rarity={selected?.rarity ?? null}
        variant="dropdown"
        tone={triggerTone}
        showRarityBadge={Boolean(selected?.rarity)}
        interactive
        contentClassName={triggerClassName}
        right={
          <span className="text-xs text-muted">
            {open ? "▲" : "▼"}
          </span>
        }
      />

      <FloatingPortal>
        {dropdown}
      </FloatingPortal>
    </div>
  );
}
