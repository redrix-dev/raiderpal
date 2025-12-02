"use client";

import { useState } from "react";

export default function ItemsList({ initialItems }: { initialItems: any[] }) {
  const [items] = useState<any[]>(initialItems);
  const [query, setQuery] = useState("");

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search items..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 rounded bg-gray-900 border-gray-700 text-gray-100"
      />

      <ul className="space-y-2">
        {filtered.map((item) => (
          <li key={item.id}>
            <a
              href={`/items/${item.id}`}
              className="flex items-center gap-3 p-3 rounded bg-gray-800 text-gray-100 border border-gray-700 hover:bg-gray-700"
            >
              {/* Icon */}
              {item.icon && (
                <img
                  src={item.icon}
                  alt={item.name}
                  className="w-10 h-10 rounded border border-gray-700"
                />
              )}

              {/* Name + Type */}
              <div className="flex flex-col">
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-gray-400">{item.item_type}</span>
              </div>

              {/* Rarity pill */}
              <span
                className={`ml-auto px-2 py-1 text-xs rounded ${
                  item.rarity === "Common"
                    ? "bg-gray-700 text-gray-300"
                    : item.rarity === "Uncommon"
                    ? "bg-green-700 text-green-200"
                    : item.rarity === "Rare"
                    ? "bg-blue-700 text-blue-200"
                    : item.rarity === "Epic"
                    ? "bg-purple-700 text-purple-200"
                    : "bg-yellow-700 text-yellow-200"
                }`}
              >
                {item.rarity}
              </span>
            </a>
          </li>
        ))}

        {/* No results */}
        {filtered.length === 0 && (
          <li className="text-gray-400 italic">No matching items.</li>
        )}
      </ul>
    </div>
  );
}
