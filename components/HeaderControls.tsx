"use client";

import { useState } from "react";
import { TopNavMenu } from "./TopNavMenu";
import { RaidRemindersDrawer } from "./RaidRemindersDrawer";
import { LongCacheIndicator } from "./LongCacheToggle";
import { useRaidReminders } from "@/hooks/useRaidReminders";

export function HeaderControls() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2 sm:gap-3">
      <LongCacheIndicator className="h-10" />

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-3 h-10 text-xs sm:text-sm font-medium text-slate-100 transition hover:border-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950 whitespace-nowrap"
      >
        <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
        Raid Reminders
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] sm:text-xs text-slate-200">
          {count}
        </span>
      </button>

      <TopNavMenu />

      <RaidRemindersDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
