"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

export type ReminderItem = {
  id: string;
  name: string;
  icon?: string | null;
  rarity?: string | null;
  lootLocation?: string | null;
  note?: string;
  addedAt: number;
};

export type ReminderSort = "added" | "location" | "az" | "za";

type State = {
  items: ReminderItem[];
  sort: ReminderSort;
};

type Listener = () => void;

const STORAGE_KEY = "raid-reminders:v1";

let state: State = { items: [], sort: "added" };
const listeners = new Set<Listener>();
let hydrated = false;

function notify() {
  listeners.forEach((l) => l());
}

function setState(updater: (prev: State) => State) {
  state = updater(state);
  if (typeof window !== "undefined") {
    try {
      const toPersist = { items: state.items, sort: state.sort };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
    } catch {
      // best effort; ignore
    }
  }
  notify();
}

function hydrateFromStorage() {
  if (hydrated) return;
  if (typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<State>;
    if (parsed?.items && Array.isArray(parsed.items)) {
      state = {
        items: parsed.items.map((i) => ({
          ...i,
          addedAt: typeof i.addedAt === "number" ? i.addedAt : Date.now(),
        })),
        sort: (parsed.sort as ReminderSort) ?? "added",
      };
      notify();
    }
  } catch {
    // ignore corrupted storage
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useRaidReminders() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  const items = useMemo(() => {
    switch (snap.sort) {
      case "location":
        return [...snap.items].sort((a, b) =>
          (a.lootLocation ?? "").localeCompare(b.lootLocation ?? "")
        );
      case "az":
        return [...snap.items].sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "")
        );
      case "za":
        return [...snap.items].sort((a, b) =>
          (b.name ?? "").localeCompare(a.name ?? "")
        );
      case "added":
      default:
        return [...snap.items].sort((a, b) => a.addedAt - b.addedAt);
    }
  }, [snap.items, snap.sort]);

  function isAdded(id: string) {
    return snap.items.some((i) => i.id === id);
  }

  function add(item: Omit<ReminderItem, "addedAt">) {
    setState((prev) => {
      if (prev.items.some((i) => i.id === item.id)) return prev;
      const nextItem: ReminderItem = { ...item, addedAt: Date.now() };
      return { ...prev, items: [...prev.items, nextItem] };
    });
  }

  function addMany(itemsToAdd: Omit<ReminderItem, "addedAt">[]) {
    setState((prev) => {
      const existingIds = new Set(prev.items.map((i) => i.id));
      const nextItems = [...prev.items];
      const now = Date.now();
      itemsToAdd.forEach((item, idx) => {
        if (existingIds.has(item.id)) return;
        nextItems.push({ ...item, addedAt: now + idx });
      });
      return { ...prev, items: nextItems };
    });
  }

  function remove(id: string) {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  }

  function clear() {
    setState((prev) => ({ ...prev, items: [] }));
  }

  function updateNote(id: string, note: string) {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, note } : i)),
    }));
  }

  function setSort(sort: ReminderSort) {
    setState((prev) => ({ ...prev, sort }));
  }

  return {
    items,
    sort: snap.sort,
    isAdded,
    add,
    addMany,
    remove,
    clear,
    updateNote,
    setSort,
  };
}
