// app/page.tsx

import { LongCacheToggle } from "@/components/LongCacheToggle";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Raider Pal</h1>
        <p className="text-sm text-gray-300 max-w-2xl">
          A Raider simply cannot waste time pondering the best way
          to acquire steel springs. Raider Pal puts that info at your fingertips. Or...feet...tips? <em> We got you Scrappy</em>. Jokes aside, this is a hobby tool for something I wanted myself and somehow it turned into an entire project. Hope you find it useful too.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-2">
          <h3 className="text-lg font-semibold text-gray-100">Item Browser</h3>
          <p className="text-sm text-gray-400">
            Search and filter every known item, peek at crafting inputs and
            recycling outputs, and jump to full details.
          </p>
          <a
            href="/items/browse"
            className="inline-flex items-center gap-2 text-sm text-sky-200 hover:text-sky-100"
          >
            Go to Item Browser →
          </a>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-2">
          <h3 className="text-lg font-semibold text-gray-100">
            Recycle Helper
          </h3>
          <p className="text-sm text-gray-400">
            Pick an item you need or have and get the best recycling sources or
            outputs, with loot locations and rarity at a glance.
          </p>
          <a
            href="/recycle-helper"
            className="inline-flex items-center gap-2 text-sm text-sky-200 hover:text-sky-100"
          >
            Go to Recycle Helper →
          </a>
        </div>
      </section>

      <LongCacheToggle />
    </div>
  );
}
