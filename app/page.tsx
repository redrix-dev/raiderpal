import Link from "next/link";
import { ModulePanel } from "@/components/ModulePanel";

// app/page.tsx

export default function HomePage() {
  return (
    <div className="rounded-xl border border-[#130918] bg-panel-texture p-4 sm:p-5 space-y-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] min-h-[70vh] lg:min-h-[75vh] xl:min-h-[79vh]">
      <section className="space-y-3 sm:hidden">
        <h1 className="text-3xl font-bold tracking-wide uppercase font-condensed">
          Raider Pal
        </h1>
        <p className="text-sm text-warm-muted max-w-2xl font-medium">
          ARC Raiders item explorer & crafting companion.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ModulePanel title="Item Browser" className="h-full">
          <div className="space-y-2">
            <p className="text-sm text-warm-muted">
              Search and filter every known item, peek at crafting inputs and
              recycling outputs, and jump to full details.
            </p>
            <Link
              href="/items/browse"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-black/30 px-4 py-2.5 text-base font-medium text-[#4fc1e9] transition hover:border-[#4fc1e9] hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-[#4fc1e9] focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Go to Item Browser
            </Link>
          </div>
        </ModulePanel>

        <ModulePanel title="Recycle Helper" className="h-full">
          <div className="space-y-2">
            <p className="text-sm text-warm-muted">
              Pick an item you need or have and get the best recycling sources or
              outputs, with loot locations and rarity at a glance.
            </p>
            <Link
              href="/recycle-helper"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-black/30 px-4 py-2.5 text-base font-medium text-[#4fc1e9] transition hover:border-[#4fc1e9] hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-[#4fc1e9] focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Go to Recycle Helper
            </Link>
          </div>
        </ModulePanel>

        <ModulePanel title="Repair or Replace Calculator" className="h-full">
          <div className="space-y-2">
            <p className="text-sm text-warm-muted">
              Compare repairing versus crafting new to choose the most efficient option.
              Balance resource costs, outputs, and time to optimize your runs.
            </p>
            <Link
              href="/repair-calculator"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-black/30 px-4 py-2.5 text-base font-medium text-[#4fc1e9] transition hover:border-[#4fc1e9] hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-[#4fc1e9] focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Go to Repair/Replace Calculator
            </Link>
          </div>
        </ModulePanel>
        <ModulePanel title="About Raider Pal" className="h-full">
          <div className="space-y-2 text-sm text-warm">
            <p>
              A Raider simply cannot waste time pondering the best way to acquire steel springs.
              Raider Pal puts that info at your fingertips. Or...feet...tips? <em>We got you Scrappy.</em>
            </p>
            <p>
              Jokes aside, this is a hobby tool for something I wanted myself and somehow it turned into
              an entire project. Hope you find it useful too.
            </p>
          </div>
        </ModulePanel>
      </section>
    </div>
  );
}
