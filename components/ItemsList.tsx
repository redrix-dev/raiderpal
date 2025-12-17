"use client";

import { useState } from "react";
import type { CanonicalItemSummary } from "@/lib/data/client";

type ItemsListProps = {
  initialItems: CanonicalItemSummary[];
};

export default function ItemsList({ initialItems }: ItemsListProps) {
  const [items] = useState<CanonicalItemSummary[]>(initialItems);
  const [query, setQuery] = useState("");

  const filtered = items.filter((item) => {
    const name = item.name ?? "";
    return name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search items..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 rounded border border-slate-700 bg-slate-900 text-warm placeholder:text-warm-muted"
      />

      <ul className="space-y-2">
        {filtered.map((item) => (
          <li key={item.id}>
            <a
              href={`/items/${item.id}`}
              className="flex items-center gap-3 p-3 rounded border border-slate-700 bg-slate-900 text-warm hover:bg-slate-800"
            >
              {/* Icon */}
              {item.icon && (
                <img
                  src={item.icon}
                  alt={item.name ?? "Item icon"}
                  className="w-10 h-10 rounded border border-slate-700 bg-slate-950"
                />
              )}

              {/* Name + Type */}
              <div className="flex flex-col">
                <span className="font-medium text-warm">{item.name}</span>
                <span className="text-xs text-warm-muted font-medium">{item.item_type}</span>
              </div>

              {/* Rarity pill */}
              <span
                className={`ml-auto px-2 py-1 text-xs rounded ${
                  item.rarity === "Common"
                    ? "bg-gray-700 text-warm"
                    : item.rarity === "Uncommon"
                    ? "bg-green-700 text-warm"
                    : item.rarity === "Rare"
                    ? "bg-blue-700 text-warm"
                    : item.rarity === "Epic"
                    ? "bg-purple-700 text-warm"
                    : "bg-yellow-700 text-warm"
                }`}
              >
                {item.rarity}
              </span>
            </a>
          </li>
        ))}

        {/* No results */}
        {filtered.length === 0 && (
          <li className="text-warm-muted italic">No matching items.</li>
        )}
      </ul>
    </div>
  );
}
