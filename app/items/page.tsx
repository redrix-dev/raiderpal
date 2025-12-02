// app/items/page.tsx

import ItemsList from "@/components/ItemsList";
import { getAllItems } from "@/data/items";

export default async function ItemsPage() {
  const items = await getAllItems();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Items</h1>
      <ItemsList initialItems={items} />
    </div>
  );
}
