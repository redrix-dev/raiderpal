import Link from "next/link";

// app/page.tsx

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3 sm:hidden">
        <h1 className="text-3xl font-semibold tracking-tight">Raider Pal</h1>
        <p className="text-sm text-gray-300 max-w-2xl">
          ARC Raiders item explorer & crafting companion.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-2">
          <h3 className="text-lg font-semibold text-gray-100">Item Browser</h3>
          <p className="text-sm text-gray-400">
            Search and filter every known item, peek at crafting inputs and
            recycling outputs, and jump to full details.
          </p>
          <Link
            href="/items/browse"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm font-medium text-sky-100 transition hover:border-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Go to Item Browser
          </Link>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-2">
          <h3 className="text-lg font-semibold text-gray-100">
            Recycle Helper
          </h3>
          <p className="text-sm text-gray-400">
            Pick an item you need or have and get the best recycling sources or
            outputs, with loot locations and rarity at a glance.
          </p>
          <Link
            href="/recycle-helper"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm font-medium text-sky-100 transition hover:border-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Go to Recycle Helper
          </Link>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-2">
          <h3 className="text-lg font-semibold text-gray-100">
            Repair or Replace Calculator
          </h3>
          <p className="text-sm text-gray-400">
            Compare repairing versus crafting new to choose the most efficient option.
            Balance resource costs, outputs, and time to optimize your runs.
          </p>
          <Link
            href="/repair-calculator"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm font-medium text-sky-100 transition hover:border-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Go to Repair/Replace Calculator
          </Link>
        </div>
      </section>

      <details className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 text-sm text-gray-300">
        <summary className="cursor-pointer text-slate-100 font-semibold">
          About Raider Pal
        </summary>
        <div className="mt-3 space-y-2 text-gray-300">
          <p>
            A Raider simply cannot waste time pondering the best way to acquire steel springs.
            Raider Pal puts that info at your fingertips. Or...feet...tips? <em>We got you Scrappy.</em>
          </p>
          <p>
            Jokes aside, this is a hobby tool for something I wanted myself and somehow it turned into
            an entire project. Hope you find it useful too.
          </p>
        </div>
      </details>
    </div>
  );
}
