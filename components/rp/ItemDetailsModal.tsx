"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { Panel } from "@/components/ui/Panel";
import type {
  CanonicalItemSummary,
  CraftingComponentRow,
  RecyclingOutputRow,
  RecyclingSourceRow,
  UsedInRow,
} from "@/lib/data/client";

type BrowseItem = CanonicalItemSummary & { workbench?: string | null };

type ItemDetailsModalProps = {
  item: BrowseItem;
  details: {
    crafting: CraftingComponentRow[];
    recycling: RecyclingOutputRow[];
    sources: RecyclingSourceRow[];
    usedIn: UsedInRow[];
  } | null;
  loading: {
    crafting: boolean;
    recycling: boolean;
    sources: boolean;
    usedIn: boolean;
  };
  onClose: () => void;
  dialogId: string;
  lastFocusedRef: React.MutableRefObject<HTMLElement | null>;
};

type TabId = "crafting" | "recycling" | "sources" | "usedIn";

const TABS: { id: TabId; label: string }[] = [
  { id: "crafting", label: "Crafting" },
  { id: "recycling", label: "Recycles Into" },
  { id: "sources", label: "Best Sources" },
  { id: "usedIn", label: "Used In" },
];

export function ItemDetailsModal({
  item,
  details,
  loading,
  onClose,
  dialogId,
  lastFocusedRef,
}: ItemDetailsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = `${dialogId}-title`;
  const [activeTab, setActiveTab] = useState<TabId>("crafting");
  const [hideWeapons, setHideWeapons] = useState(true);

  // Responsive layout classes
  const scrollableContentClasses = "flex-1 min-h-0 rounded-b-2xl overflow-y-auto sm:overflow-y-hidden";
  const innerContentClasses = "space-y-6 flex flex-col sm:min-h-0";
  const overviewStatsGridClasses = "grid gap-4 grid-cols-1 sm:grid-cols-2";
  const tabContentClasses = "bg-surface-panel p-4 sm:p-5 sm:overflow-y-auto sm:flex-1 sm:min-h-0 sm:max-h-[320px]";

  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const elementToFocus = lastFocusedRef.current;
    return () => {
      if (elementToFocus) {
        elementToFocus.focus();
      }
    };
  }, [lastFocusedRef]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClose();
    }
    if (e.key === "Tab") {
      const focusable = Array.from(
        (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const isLoading = loading?.[activeTab] ?? false;

  // Filter crafting to remove blueprints
  const craftingData = (details?.crafting ?? []).filter(
    (c) => (c.component?.item_type ?? "").toLowerCase() !== "blueprint"
  );

  // Filter sources to optionally hide weapons
  const sourcesData = hideWeapons
    ? (details?.sources ?? []).filter(
        (s) => (s.source?.item_type ?? "").toLowerCase() !== "weapon"
      )
    : (details?.sources ?? []);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-surface-base/80 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-7xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        id={dialogId}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Dark chrome header - FIXED */}
        <CardHeader className="rounded-t-2xl flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-2xl font-condensed font-semibold uppercase tracking-wide text-primary-invert truncate"
              >
                {item.name ?? "Unknown item"}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-invert">
                {item.item_type && <span>{item.item_type}</span>}
                {item.loot_area && <span>Loot: {item.loot_area}</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              ref={closeButtonRef}
              className="shrink-0 rounded-md border border-border-strong bg-surface-base/80 px-3 py-1.5 text-xs text-primary-invert hover:border-brand-cyan/60 hover:text-brand-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
              aria-label="Close item details"
            >
              Close
            </button>
          </div>
        </CardHeader>

        {/* Scrollable content area */}
        <div className={scrollableContentClasses}>
          <Panel
            variant="light"
            padding="roomy"
            className="!rounded-none border-t-0 border-border-strong h-full flex flex-col min-h-0"
          >
            <div className={innerContentClasses}>
              {/* Overview and Stats cards */}
              <div className={overviewStatsGridClasses}>
                {/* Overview Card */}
                <div className="overflow-hidden rounded-lg border border-border-subtle shadow-sm shadow-black/30 flex flex-col flex-1 min-h-0">
                  <CardHeader
                    className="rounded-none border-0 border-b border-border-subtle"
                    contentClassName="px-4 py-2 sm:px-5 sm:py-2"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-invert">
                      Overview
                    </div>
                  </CardHeader>
                  
                  {/* Darker inner panel */}
                  <div className="bg-surface-panel p-4 sm:p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 flex-shrink-0 rounded-md border border-border-subtle bg-surface-card p-2">
                        {item.icon ? (
                          <Image
                            src={item.icon}
                            alt={item.name ?? "Item icon"}
                            width={56}
                            height={56}
                            sizes="56px"
                            loading="lazy"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="h-full w-full rounded bg-surface-card" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg font-condensed font-semibold text-primary">
                          {item.name ?? "Unknown item"}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                          <RarityBadge rarity={item.rarity} />
                          {item.item_type && <span>{item.item_type}</span>}
                        </div>
                      </div>
                    </div>
                    
                    {item.description && (
                      <Card className="!p-3">
                        <p className="text-sm text-primary leading-relaxed">
                          {item.description}
                        </p>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Stats Card */}
                <div className="overflow-hidden rounded-lg border border-border-subtle shadow-sm shadow-black/30">
                  <CardHeader
                    className="rounded-none border-0 border-b border-border-subtle"
                    contentClassName="px-4 py-2 sm:px-5 sm:py-2"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-invert">
                      Stats
                    </div>
                  </CardHeader>
                  
                  {/* Darker inner panel */}
                  <div className="bg-surface-panel p-4 sm:p-5">
                    <div className="space-y-2">
                      {item.value != null && (
                        <Card className="!p-3">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <dt className="text-muted">Value</dt>
                            <dd className="font-semibold text-primary">
                              {item.value}
                            </dd>
                          </div>
                        </Card>
                      )}
                      {item.item_type && (
                        <Card className="!p-3">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <dt className="text-muted">Type</dt>
                            <dd className="font-semibold text-primary">
                              {item.item_type}
                            </dd>
                          </div>
                        </Card>
                      )}
                      {item.workbench && (
                        <Card className="!p-3">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <dt className="text-muted">Workbench</dt>
                            <dd className="font-semibold text-primary">
                              {item.workbench}
                            </dd>
                          </div>
                        </Card>
                      )}
                      {item.loot_area && (
                        <Card className="!p-3">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <dt className="text-muted">Loot Area</dt>
                            <dd className="font-semibold text-primary">
                              {item.loot_area}
                            </dd>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details/Tabs Section */}
              <div className="overflow-hidden rounded-lg border border-border-subtle shadow-sm shadow-black/30 flex flex-col min-h-0">
                {/* Tabs in the dark header */}
                <div className="border-b border-border-subtle bg-surface-base text-primary-invert"
                  style={{
                    backgroundImage: 'url("/backgrounds/ARC_Raiders_Module_Background.png")',
                    backgroundRepeat: "repeat-x",
                    backgroundSize: "auto 100%",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 pt-3 pb-3">
                    <div className="flex flex-wrap gap-2">
                      {TABS.map((tab) => {
                        const isActive = tab.id === activeTab;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3.5 py-2 rounded-md border text-xs font-semibold font-condensed uppercase tracking-wide transition ${
                              isActive
                                ? "border-brand-cyan bg-brand-cyan/15 text-brand-cyan"
                                : "border-transparent text-muted-invert hover:text-primary-invert"
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Hide Weapons Toggle (only show on sources tab) */}
                    {activeTab === "sources" && (
                      <label className="inline-flex items-center gap-2 text-xs text-muted-invert cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hideWeapons}
                          onChange={(e) => setHideWeapons(e.target.checked)}
                          className="h-4 w-4 rounded border-border-subtle bg-surface-base/50 text-brand-cyan focus:ring-brand-cyan focus:ring-offset-surface-base"
                        />
                        <span className="whitespace-nowrap">Hide weapons</span>
                      </label>
                    )}
                  </div>
                </div>
                
                {/* Darker content area - SCROLLABLE */}
                <div className={tabContentClasses}>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={`details-loading-${index}`}
                          className="h-10 rounded-md border border-border-subtle bg-surface-card animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    <>
                      {activeTab === "crafting" && (
                        <TabContent
                          rows={craftingData}
                          emptyText="No crafting recipe."
                          mapRow={(c) => ({
                            key: c.component_id ?? "unknown",
                            href: `/items/${c.component_id}`,
                            name: c.component?.name ?? "Unknown component",
                            icon: c.component?.icon,
                            quantity: c.quantity ?? undefined,
                          })}
                        />
                      )}

                      {activeTab === "recycling" && (
                        <TabContent
                          rows={details?.recycling ?? []}
                          emptyText="No recycling outputs."
                          mapRow={(r) => ({
                            key: r.component_id ?? "unknown",
                            href: `/items/${r.component_id}`,
                            name: r.component?.name ?? "Unknown component",
                            icon: r.component?.icon,
                            quantity: r.quantity ?? undefined,
                          })}
                        />
                      )}

                      {activeTab === "sources" && (
                        <TabContent
                          rows={sourcesData}
                          emptyText={hideWeapons ? "No direct recycle sources (weapons hidden)." : "No direct recycle sources."}
                          mapRow={(s) => ({
                            key: s.source_item_id ?? "source",
                            href: `/items/${s.source_item_id}`,
                            name: s.source?.name ?? "Unknown source",
                            icon: s.source?.icon,
                            quantity: s.quantity,
                            quantitySuffix: "per recycle",
                          })}
                        />
                      )}

                      {activeTab === "usedIn" && (
                        <TabContent
                          rows={details?.usedIn ?? []}
                          emptyText="Not used in any recipes."
                          mapRow={(u) => ({
                            key: u.product_item_id ?? "unknown",
                            href: `/items/${u.product_item_id}`,
                            name: u.product?.name ?? "Unknown item",
                            icon: u.product?.icon,
                            quantity: u.quantity ?? undefined,
                          })}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

type TabListRow = {
  key: string;
  href: string;
  name: string;
  icon?: string | null;
  quantity?: number;
  quantitySuffix?: string;
};

type TabContentProps<TRow> = {
  rows: TRow[];
  emptyText: string;
  mapRow: (row: TRow) => TabListRow;
};

function TabContent<TRow>({ rows, emptyText, mapRow }: TabContentProps<TRow>) {
  if (!rows || rows.length === 0) {
    return (
      <Card className="!p-4">
        <p className="text-sm text-muted">{emptyText}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((raw, idx) => {
        const row = mapRow(raw);
        return (
          <Card key={`${row.key}-${idx}`} className="!p-3">
            <div className="flex items-center justify-between gap-3">
              <a
                href={row.href}
                className="flex items-center gap-3 min-w-0 text-primary hover:underline"
              >
                {row.icon && (
                  <Image
                    src={row.icon}
                    alt={row.name}
                    width={36}
                    height={36}
                    sizes="36px"
                    loading="lazy"
                    className="h-9 w-9 rounded border border-border-subtle bg-surface-panel object-contain flex-shrink-0"
                  />
                )}
                <span className="truncate font-medium text-sm">{row.name}</span>
              </a>

              <div className="flex-shrink-0 text-right text-primary">
                {row.quantity != null && (
                  <span className="font-semibold text-sm">x{row.quantity}</span>
                )}
                {row.quantitySuffix && (
                  <span className="block text-[11px] text-muted">
                    {row.quantitySuffix}
                  </span>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
