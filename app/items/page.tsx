// app/items/page.tsx

import ItemsList from "@/components/ItemsList";
import { REVALIDATE } from "@/lib/constants";
import { listCanonicalItems } from "@/lib/data";

export const dynamic = "force-dynamic";
const REVALIDATE_NEVER = REVALIDATE.NEVER;

export const revalidate = REVALIDATE_NEVER;

export default async function ItemsPage() {
  const items = await listCanonicalItems();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-wide uppercase font-condensed mb-4">
        Items
      </h1>
      <ItemsList initialItems={items} />
    </div>
  );
}
