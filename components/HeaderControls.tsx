"use client";

import { useState } from "react";
import { TopNavMenu } from "./TopNavMenu";
import { RaidRemindersDrawer } from "./RaidRemindersDrawer";
import { useRaidReminders } from "@/hooks/useRaidReminders";

export function HeaderControls() {
  const [open, setOpen] = useState(false);
  const { items } = useRaidReminders();
  const count = items.length;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
        Raid Reminders
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
          {count}
        </span>
      </button>

      <TopNavMenu />

      <RaidRemindersDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
