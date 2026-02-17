import { ToolPanel } from "@/components/ui/ToolPanel";

export default function Loading() {
  return (
    <ToolPanel density="compact" width="wide">
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-64 rounded bg-skeleton-fill" />
        <div className="h-28 rounded-lg border border-skeleton-border bg-skeleton-surface" />
        <div className="h-52 rounded-lg border border-skeleton-border bg-skeleton-surface" />
      </div>
    </ToolPanel>
  );
}
