import { ToolPanel } from "@/components/ui/ToolPanel";

export default function Loading() {
  return (
    <ToolPanel density="compact">
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="h-28 rounded-lg border border-white/5 bg-black/20" />
        <div className="h-52 rounded-lg border border-white/5 bg-black/20" />
      </div>
    </ToolPanel>
  );
}
