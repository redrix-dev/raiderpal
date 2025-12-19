import { ModulePanel } from "@/components/ModulePanel";
import { Panel } from "@/components/ui/Panel";

export default function Loading() {
  return (
    <Panel className="space-y-4 min-h-[70vh] lg:min-h-[75vh] xl:min-h-[79vh]">
      <ModulePanel title="Items Browser">
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-72 rounded bg-white/10" />
          <div className="h-10 w-full rounded bg-white/5" />
          <div className="grid gap-3 md:grid-cols-2 min-w-0">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`items-browse-loading-${index}`}
                className="h-16 rounded-lg border border-white/5 bg-black/20"
              />
            ))}
          </div>
        </div>
      </ModulePanel>
    </Panel>
  );
}
