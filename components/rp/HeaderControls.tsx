"use client";

import { useState } from "react";
import { TopNavMenu } from "@/components/rp/TopNavMenu";
import { RaidRemindersDrawer } from "@/components/rp/RaidRemindersDrawer";
import { LongCacheIndicator } from "@/components/rp/LongCacheToggle";
import { useRaidReminders } from "@/hooks/useRaidReminders";

export function HeaderControls() {
  const [open, setOpen] = useState(false);
  const { items } = useRaidReminders();
  const count = items.length;

  return (
    <div className="flex items-center justify-end gap-2 sm:gap-3">
      <LongCacheIndicator className="h-10" />

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface-panel px-3 h-10 text-xs sm:text-sm font-medium text-primary transition hover:border-brand-cyan/60 hover:text-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-surface-base whitespace-nowrap"
      >
        <span className="h-2 w-2 rounded-full border border-border-strong bg-brand-cyan animate-pulse" />
        Raid Reminders
        <span className="rounded-full bg-surface-base/95 border border-border-strong px-2 py-0.5 text-[11px] sm:text-xs text-brand-cyan">
          {count}
        </span>
      </button>

      <TopNavMenu />

      <RaidRemindersDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
