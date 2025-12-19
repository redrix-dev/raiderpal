import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";

export default function Loading() {
  return (
    <Panel className="space-y-4 min-h-[70vh] lg:min-h-[75vh] xl:min-h-[79vh]">
      <div className="grid gap-5 md:grid-cols-2 md:gap-6 items-stretch">
        <Card className="h-full overflow-hidden p-3 lg:p-4">
          <div className="space-y-4 animate-pulse">
            <div className="h-24 w-24 rounded border border-white/10 bg-black/40" />
            <div className="h-6 w-3/4 rounded bg-white/10" />
            <div className="h-4 w-1/2 rounded bg-white/10" />
            <div className="h-16 w-full rounded bg-white/5" />
          </div>
        </Card>

        <Card className="h-full overflow-hidden p-3 lg:p-4">
          <div className="space-y-3 animate-pulse">
            <div className="h-5 w-40 rounded bg-white/10" />
            <div className="h-10 w-full rounded bg-white/5" />
            <div className="h-10 w-full rounded bg-white/5" />
            <div className="h-10 w-full rounded bg-white/5" />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-3 lg:p-4">
        <div className="space-y-3 animate-pulse">
          <div className="h-8 w-full rounded bg-white/5" />
          <div className="h-24 w-full rounded bg-white/5" />
          <div className="h-24 w-full rounded bg-white/5" />
        </div>
      </Card>
    </Panel>
  );
}
