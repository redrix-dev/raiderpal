"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  ReminderItem,
  ReminderSort,
  useRaidReminders,
} from "@/hooks/useRaidReminders";

type RaidRemindersDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function RaidRemindersDrawer({ open, onClose }: RaidRemindersDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const { items, sort, remove, clear, updateNote, setSort } = useRaidReminders();

  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined") {
      setPortalEl(document.body);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (typeof document !== "undefined") {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
    }
    closeButtonRef.current?.focus();
    return () => {
      lastFocusedRef.current?.focus();
    };
  }, [open]);

  if (!mounted || !open || !portalEl) return null;

  const sorted = items;
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
      <div className="absolute inset-0 bg-surface-base/70" />

      <div className="relative flex h-full items-start justify-center pt-10 pointer-events-none">
        <div
          className="relative w-full max-w-4xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <SectionHeader className="rounded-t-2xl" accent>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-condensed font-semibold uppercase tracking-wide text-primary-invert">
                  Raid Reminders
                </h2>
                <p className="mt-1 text-xs text-muted-invert">
                  {empty ? "Nothing added yet" : `${sorted.length} item(s) saved`}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                ref={closeButtonRef}
                className="shrink-0 rounded-md border border-border-strong bg-surface-base/80 px-3 py-1.5 text-xs text-primary-invert hover:border-brand-cyan/60 hover:text-brand-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
                aria-label="Close reminders"
              >
                Close
              </button>
            </div>
          </SectionHeader>

          <Card className="rounded-t-none border-t-0 border-border-strong !p-0">
            <div className="px-6 py-4 border-b border-border-subtle bg-surface-panel flex items-center gap-3 text-xs text-primary">
              <button
                type="button"
                onClick={handleClear}
                disabled={empty}
                className={`rounded-md px-3 py-1.5 text-xs font-medium border ${
                  empty
                    ? "cursor-not-allowed border-border-strong bg-surface-panel text-muted opacity-60"
                    : "border-brand-amber/60 bg-brand-amber/10 text-primary hover:bg-brand-amber/20"
                }`}
              >
                Clear all
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <label className="text-xs text-muted font-medium">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as ReminderSort)}
                  className="rounded-md border border-border-strong bg-surface-panel px-2 py-1 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                >
                  <option value="added">Order added</option>
                  <option value="location">Loot location</option>
                  <option value="az">Name A-Z</option>
                  <option value="za">Name Z-A</option>
                </select>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-3">
              {empty ? (
                <div className="rounded-lg border border-dashed border-border-subtle bg-surface-panel p-4 text-sm text-muted">
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
          </Card>
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
    <div className="rounded-lg border border-border-subtle bg-surface-panel p-3">
      <div className="flex items-start gap-3">
        {item.icon && (
          <Image
            src={item.icon}
            alt={item.name}
            width={48}
            height={48}
            sizes="48px"
            loading="lazy"
            className="h-12 w-12 rounded border border-border-subtle bg-surface-card object-contain"
          />
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-primary truncate">
                {item.name}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted font-medium">
                <RarityBadge rarity={item.rarity} />
                {item.lootLocation && (
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-brand-cyan" />
                    {item.lootLocation}
                  </span>
                )}
              </div>
              {item.lootLocation && (
                <div className="text-[11px] text-muted font-medium mt-1">
                  Loot location(s): {item.lootLocation}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 rounded-md px-2 py-1 text-xs border border-brand-amber/60 bg-brand-amber/10 text-primary hover:bg-brand-amber/20 focus:outline-none focus:ring-1 focus:ring-brand-cyan"
              aria-label={`Remove ${item.name}`}
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-md px-2 py-1 text-xs border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/15 focus:outline-none focus:ring-1 focus:ring-brand-cyan"
            >
              {item.note ? "Edit note" : "Add note"}
            </button>
          </div>

          {editing ? (
            <div className="mt-3 space-y-2">
              <label className="text-[11px] text-muted font-medium">
                Notes (200 chars)
              </label>
              <textarea
                value={noteValue}
                onChange={(e) => setTempNote(e.target.value.slice(0, 200))}
                rows={3}
                className="w-full rounded-md border border-border-strong bg-surface-card px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                placeholder="Add a reminder or comment"
              />
              <div className="flex items-center justify-between text-[10px] text-muted">
                <span>{charLeft} left</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onNoteChange(noteValue.trim());
                      setEditing(false);
                    }}
                    className="rounded-md px-3 py-1.5 text-xs font-medium border border-brand-cyan/70 bg-brand-cyan/15 text-brand-cyan hover:border-brand-cyan"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempNote(item.note ?? "");
                      setEditing(false);
                    }}
                    className="rounded-md px-3 py-1.5 text-xs font-medium border border-border-strong bg-surface-card text-primary hover:border-border-subtle"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-primary">
              {item.note ? (
                <div className="whitespace-pre-line">{item.note}</div>
              ) : (
                <span className="text-muted text-xs">No note yet.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
