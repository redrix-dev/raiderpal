// app/items/page.tsx

import ItemsList from "@/components/ItemsList";
import { getAllItems } from "@/data/items";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ItemsPage() {
  const items = await getAllItems();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-wide uppercase font-condensed mb-4">
        Items
      </h1>
      <ItemsList initialItems={items} />
    </div>
  );
}
