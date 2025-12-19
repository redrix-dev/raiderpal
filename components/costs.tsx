import Image from "next/image";

export type CostRow = {
  id: string;
  name?: string | null;
  quantity: number;
  rarity?: string | null;
  icon?: string | null;
  isCredit?: boolean;
};

export function CostCard({
  title,
  items,
  emptyLabel = "No data.",
  minRows = 0,
}: {
  title: string;
  items: CostRow[];
  emptyLabel?: string;
  minRows?: number;
}) {
  const showLegacyEmpty =
    items.length === 0 && minRows === 0 && emptyLabel === "No data.";
  const emptyRowCount =
    items.length === 0
      ? Math.max(0, minRows - 1)
      : Math.max(0, minRows - items.length);

  return (
    <div className="rounded-lg border border-white/5 bg-black/25 p-4 2xl:[.ui-compact_&]:p-3 space-y-3 2xl:[.ui-compact_&]:space-y-2.5">
      <div className="text-base 2xl:[.ui-compact_&]:text-sm font-semibold text-text-primary">{title}</div>
      <div className="space-y-3">
        {showLegacyEmpty ? (
          <div className="text-sm text-text-muted">No data.</div>
        ) : (
          <>
            {items.length === 0 ? (
              <div className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-black/30 px-3 py-2 2xl:[.ui-compact_&]:px-2.5 2xl:[.ui-compact_&]:py-1.5">
                <div className="text-sm 2xl:[.ui-compact_&]:text-xs text-warm-muted">{emptyLabel}</div>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-black/30 px-3 py-2 2xl:[.ui-compact_&]:px-2.5 2xl:[.ui-compact_&]:py-1.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.icon && (
                      <Image
                        src={item.icon}
                        alt={item.name ?? "Component"}
                        width={32}
                        height={32}
                        sizes="32px"
                        loading="lazy"
                        className="h-8 w-8 2xl:[.ui-compact_&]:h-7 2xl:[.ui-compact_&]:w-7 rounded border border-white/10 bg-black/50 object-contain flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm 2xl:[.ui-compact_&]:text-xs text-warm font-semibold">
                        {item.name}
                      </div>
                      {item.isCredit ? (
                        <div className="text-[11px] 2xl:[.ui-compact_&]:text-[10px] text-warm-muted">Credit</div>
                      ) : item.rarity ? (
                        <div className="text-[11px] 2xl:[.ui-compact_&]:text-[10px] text-warm-muted">
                          {item.rarity}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {item.quantity !== 0 ? (
                    <div
                      className={`text-sm 2xl:[.ui-compact_&]:text-xs font-semibold ${
                        item.quantity < 0 ? "text-emerald-300" : "text-warm"
                      }`}
                    >
                      {item.quantity < 0
                        ? `+${Math.abs(item.quantity)}`
                        : `x${item.quantity}`}
                    </div>
                  ) : (
                    <div className="text-sm 2xl:[.ui-compact_&]:text-xs font-semibold text-warm-muted">-</div>
                  )}
                </div>
              ))
            )}
            {Array.from({ length: emptyRowCount }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-black/30 px-3 py-2 2xl:[.ui-compact_&]:px-2.5 2xl:[.ui-compact_&]:py-1.5 opacity-0"
                aria-hidden="true"
              >
                <div className="text-sm 2xl:[.ui-compact_&]:text-xs">placeholder</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
