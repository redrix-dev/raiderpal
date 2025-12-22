import { ModulePanel } from "@/components/ModulePanel";
import { ToolPanel } from "@/components/ToolPanel";
import { PrimaryButton } from "@/components/PrimaryButton";

// app/page.tsx

export default function HomePage() {
  return (
    <ToolPanel>
      <section className="space-y-3 sm:hidden">
        <h1 className="text-3xl font-bold tracking-wide uppercase font-condensed">
          Raider Pal
        </h1>
        <p className="text-sm text-muted max-w-2xl font-medium">
          ARC Raiders item explorer & crafting companion.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ModulePanel
          title="Item Browser"
          className="h-full"
          headerClassName="[&_>div]:justify-center [&_h2]:text-center"
        >
          <div className="space-y-2">
            <p className="text-sm text-muted">
              Search and filter every known item, peek at crafting inputs and
              recycling outputs, and jump to full details.
            </p>
            <PrimaryButton href="/item-browser" variant="cta">
              Go to Item Browser
            </PrimaryButton>
          </div>
        </ModulePanel>

        <ModulePanel
          title="Repair or Replace Calculator"
          className="h-full"
          headerClassName="[&_>div]:justify-center [&_h2]:text-center"
        >
          <div className="space-y-2">
            <p className="text-sm text-muted">
              Compare repairing versus crafting new to choose the most efficient option.
              Balance resource costs, outputs, and time to optimize your runs.
            </p>
            <PrimaryButton href="/repair-calculator" variant="cta">
              Go to Repair/Replace Calculator
            </PrimaryButton>
          </div>
        </ModulePanel>
        <ModulePanel title="About Raider Pal" className="h-full" headerClassName="[&_>div]:justify-center [&_h2]:text-center">
          <div className="space-y-2 text-sm text-primary">
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
    </ToolPanel>
  );
}
