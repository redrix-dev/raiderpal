// app/items/[id]/page.tsx

import { notFound } from "next/navigation";
import { getItemById } from "@/data/items";
import { getCraftingForItem } from "@/data/crafting";
import { getRecyclingForItem } from "@/data/recycling";
import { getUsedInForItem } from "@/data/usedIn";
import { getBestSourcesForItem } from "@/data/yields"; // ⬅ new import

type ItemPageProps = {
  // Next 14/15: params is async
  params: Promise<{ id: string }>;
};

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;

  const [item, crafting, recycling, usedIn, bestSources] = await Promise.all([
    getItemById(id),
    getCraftingForItem(id),
    getRecyclingForItem(id),
    getUsedInForItem(id),
    getBestSourcesForItem(id), // ⬅ new call
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div className="text-gray-100 p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {item.icon && (
          <img
            src={item.icon}
            alt={item.name ?? "Item image"}
            className="w-16 h-16 rounded border border-gray-700"
          />
        )}

        <div>
          <h1 className="text-2xl font-bold">{item.name}</h1>

          {item.rarity && (
            <span
              className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
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
          )}
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-gray-400">{item.description}</p>
      )}

      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-2 text-gray-200">Stats</h2>
        <ul className="text-gray-300 space-y-1">
          {item.value != null && (
            <li>
              <strong>Value:</strong> {item.value}
            </li>
          )}
          {item.item_type && (
            <li>
              <strong>Type:</strong> {item.item_type}
            </li>
          )}
          {item.workbench && (
            <li>
              <strong>Workbench:</strong> {item.workbench}
            </li>
          )}
          {item.loot_area && (
            <li>
              <strong>Loot Area:</strong> {item.loot_area}
            </li>
          )}
        </ul>
      </div>

      {/* Crafting */}
      {crafting?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-200">
            Crafting Recipe
          </h2>
          <ul className="space-y-2">
            {crafting.map((c, idx) => (
              <li
                key={`${c.component_id ?? "unknown"}-${idx}`}
                className="flex items-center gap-3 p-2 bg-gray-800 border border-gray-700 rounded"
              >
                {c.component_icon && (
                  <img
                    src={c.component_icon}
                    alt={c.component_name ?? "Component icon"}
                    className="w-8 h-8 rounded border border-gray-700"
                  />
                )}

                <a
                  href={`/items/${c.component_id}`}
                  className="text-gray-100 hover:underline"
                >
                  {c.component_name}
                </a>
                {c.quantity != null && (
                  <span className="text-gray-400 ml-auto">×{c.quantity}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recycling */}
      {recycling?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-200">
            Recycles Into
          </h2>
          <ul className="space-y-2">
            {recycling.map((r: any, idx: number) => (
              <li
                key={`${r.component_id}-${idx}`}
                className="flex items-center gap-3 p-2 bg-gray-800 border border-gray-700 rounded"
              >
                {r.component_icon && (
                  <img
                    src={r.component_icon}
                    alt={r.component_name ?? "Component icon"}
                    className="w-8 h-8 rounded border border-gray-700"
                  />
                )}

                <a
                  href={`/items/${r.component_id}`}
                  className="text-gray-100 hover:underline"
                >
                  {r.component_name}
                </a>
                <span className="text-gray-400 ml-auto">×{r.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Best Sources (direct recycle) */}
      {bestSources?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-200">
            Best Sources (direct recycle)
          </h2>
          <ul className="space-y-2">
            {bestSources.map((s, idx) => (
              <li
                key={`${s.sourceItemId}-${idx}`}
                className="flex items-center gap-3 p-2 bg-gray-800 border border-gray-700 rounded"
              >
                {s.sourceIcon && (
                  <img
                    src={s.sourceIcon}
                    alt={s.sourceName ?? "Source item"}
                    className="w-8 h-8 rounded border border-gray-700"
                  />
                )}

                <a
                  href={`/items/${s.sourceItemId}`}
                  className="text-gray-100 hover:underline"
                >
                  {s.sourceName}
                </a>
                <span className="text-gray-400 ml-auto">
                  ×{s.quantity} per recycle
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Used In */}
      {usedIn?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-200">Used In</h2>
          <ul className="space-y-2">
            {usedIn.map((u: any, idx: number) => (
              <li
                key={`${u.product_id}-${idx}`}
                className="flex items-center gap-3 p-2 bg-gray-800 border border-gray-700 rounded"
              >
                {u.product_icon && (
                  <img
                    src={u.product_icon}
                    alt={u.product_name ?? "Product icon"}
                    className="w-8 h-8 rounded border border-gray-700"
                  />
                )}

                <a
                  href={`/items/${u.product_id}`}
                  className="text-gray-100 hover:underline"
                >
                  {u.product_name}
                </a>
                <span className="text-gray-400 ml-auto">
                  {u.quantity && `×${u.quantity}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
