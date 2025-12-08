"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RarityBadge } from "./ItemCard";
import {
  ReminderItem,
  ReminderSort,
  useRaidReminders,
} from "@/hooks/useRaidReminders";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function RaidRemindersDrawer({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const {
    items,
    sort,
    remove,
    clear,
    updateNote,
    setSort,
  } = useRaidReminders();

  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined") {
      setPortalEl(document.body);
    }
  }, []);

  if (!mounted || !open || !portalEl) return null;

  const sorted = items; // already sorted in hook

  const empty = sorted.length === 0;

  function handleClear() {
    if (empty) return;
    if (window.confirm("Clear all reminders?")) {
      clear();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 px-3 sm:px-6"
      onClick={onClose}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />

      <div className="relative flex h-full items-start justify-center pt-10 pointer-events-none">
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-800 bg-panel-texture shadow-2xl transform transition-transform duration-200 ease-out translate-y-0 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-900">
            <div>
              <div className="text-xs uppercase tracking-[0.08em] text-warm-muted font-medium">
                Raid Reminders
              </div>
              <div className="text-sm text-warm">
                {empty ? "Nothing added yet" : `${sorted.length} item(s) saved`}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-warm hover:text-white hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-[#4fc1e9]"
              aria-label="Close reminders"
            >
              X
            </button>
          </div>

          <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-900 text-sm">
            <button
              type="button"
              onClick={handleClear}
              disabled={empty}
              className={`rounded-md px-3 py-2 text-sm font-medium border ${
                empty
                  ? "cursor-not-allowed border-slate-800 bg-slate-900 text-warm-muted"
                  : "border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/15"
              }`}
            >
              Clear all
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs text-warm-muted font-medium">Sort</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ReminderSort)}
                className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-warm focus:outline-none focus:ring-1 focus:ring-[#4fc1e9]"
              >
                <option value="added">Order added</option>
                <option value="location">Loot location</option>
                <option value="az">Name A-Z</option>
                <option value="za">Name Z-A</option>
              </select>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[70vh] p-4 space-y-3">
            {empty ? (
              <div className="rounded-lg border border-dashed border-slate-800 bg-panel-texture p-4 text-sm text-warm">
                Add items to Raid Reminders to populate this dashboard.
              </div>
            ) : (
              sorted.map((item) => (
                <ReminderRow
                  key={item.id}
                  item={item}
                  onRemove={() => remove(item.id)}
                  onNoteChange={(note) => updateNote(item.id, note)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>,
    portalEl
  );
}

function ReminderRow({
  item,
  onRemove,
  onNoteChange,
}: {
  item: ReminderItem;
  onRemove: () => void;
  onNoteChange: (note: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [tempNote, setTempNote] = useState(item.note ?? "");

  useEffect(() => {
    setTempNote(item.note ?? "");
  }, [item.note]);

  const noteValue = tempNote;
  const charLeft = 200 - noteValue.length;

  return (
    <div className="rounded-lg border border-slate-800 bg-panel-texture p-3 shadow-sm">
      <div className="flex items-start gap-3">
        {item.icon && (
          <img
            src={item.icon}
            alt={item.name}
            className="h-12 w-12 rounded border border-slate-800 bg-slate-950 object-contain"
          />
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-warm truncate">
                {item.name}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-warm-muted font-medium">
                <RarityBadge rarity={item.rarity} />
                {item.lootLocation && (
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-[#4fc1e9]" />
                    {item.lootLocation}
                  </span>
                )}
              </div>
              {item.lootLocation && (
              <div className="text-[11px] text-warm-muted font-medium mt-1">
                  Loot location(s): {item.lootLocation}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-red-100 bg-red-900/50 hover:bg-red-800/60 focus:outline-none focus:ring-1 focus:ring-red-500"
              aria-label={`Remove ${item.name}`}
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-warm bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-[#4fc1e9]"
            >
              {item.note ? "Edit note" : "Add note"}
            </button>
          </div>

          {editing ? (
            <div className="mt-3 space-y-2">
              <label className="text-[11px] text-warm-muted font-medium">
                Notes (200 chars)
              </label>
              <textarea
                value={noteValue}
                onChange={(e) => setTempNote(e.target.value.slice(0, 200))}
                rows={3}
            className="w-full rounded-md border border-slate-800 bg-panel-texture px-3 py-2 text-sm text-warm placeholder:text-warm-muted focus:outline-none focus:ring-1 focus:ring-[#4fc1e9]"
                placeholder="Add a reminder or comment"
              />
              <div className="flex items-center justify-between text-[10px] text-warm-muted">
                <span>{charLeft} left</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onNoteChange(noteValue.trim());
                      setEditing(false);
                    }}
                    className="rounded-md px-3 py-1.5 text-xs font-medium border border-[#4fc1e9]/70 bg-[#4fc1e9]/15 text-[#4fc1e9] hover:border-[#4fc1e9]"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempNote(item.note ?? "");
                      setEditing(false);
                    }}
                    className="rounded-md px-3 py-1.5 text-xs font-medium border border-slate-700 bg-slate-900 text-warm hover:border-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-warm">
              {item.note ? (
                <div className="whitespace-pre-line">{item.note}</div>
              ) : (
                <span className="text-warm-muted text-xs">No note yet.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
