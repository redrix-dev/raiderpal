"use client";

import { useId, useMemo, useState } from "react";
import { RarityBadge } from "@/components/ItemCard";
import { cn } from "@/lib/cn";

export type PickerItem = {
  id: string;
  name: string | null;
  icon?: string | null;
  rarity?: string | null;
  subtitle?: string | null; // e.g. item_type or "Max durability: 100"
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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={dropdownId}
        className={cn(
          "w-full h-10 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-base text-warm flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#4fc1e9] hover:border-[#4fc1e9]",
          triggerClassName
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.icon && (
            <img
              src={selected.icon}
              alt={selected.name ?? "Selected item"}
              className="h-6 w-6 rounded border border-slate-700 bg-slate-950 object-contain"
            />
          )}
          <span className="truncate">
            {selected?.name ?? placeholder}
          </span>
        </span>
        <span className="ml-2 text-xs text-warm-muted">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          id={dropdownId}
          role="listbox"
          className={cn(
            "absolute z-40 left-0 top-full mt-1 w-full rounded-md border border-slate-800 bg-slate-900 shadow-lg text-xs max-h-[70vh] overflow-auto",
            dropdownClassName
          )}
        >
          <div className="border-b border-slate-800 p-2 bg-slate-900/80 rounded-t-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name..."
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-warm placeholder:text-warm-muted focus:outline-none focus:ring-1 focus:ring-[#4fc1e9]"
            />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-xs text-warm-muted">
                No items match your filters.
              </div>
            ) : (
              <ul className="divide-y divide-slate-800 text-xs">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      role="option"
                      aria-selected={item.id === selectedId}
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
                          <span className="truncate text-warm">
                            {item.name}
                          </span>
                          {item.rarity && (
                            <RarityBadge rarity={item.rarity} />
                          )}
                        </div>
                        {item.subtitle && (
                          <div className="text-[10px] text-warm-muted truncate">
                            {item.subtitle}
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
