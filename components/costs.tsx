export type CostRow = {
  id: string;
  name?: string | null;
  quantity: number;
  rarity?: string | null;
  icon?: string | null;
  isCredit?: boolean;
};

export function CostCard({ title, items }: { title: string; items: CostRow[] }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/25 p-4 space-y-3">
      <div className="text-base font-semibold text-warm">{title}</div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-warm-muted">No data.</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-black/30 px-3 py-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.icon && (
                  <img
                    src={item.icon}
                    alt={item.name ?? "Component"}
                    className="h-8 w-8 rounded border border-white/10 bg-black/50 object-contain flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm text-warm font-semibold">
                    {item.name}
                  </div>
                  {item.isCredit ? (
                    <div className="text-[11px] text-warm-muted">Credit</div>
                  ) : item.rarity ? (
                    <div className="text-[11px] text-warm-muted">{item.rarity}</div>
                  ) : null}
                </div>
              </div>
              {item.quantity !== 0 ? (
                <div
                  className={`text-sm font-semibold ${
                    item.quantity < 0 ? "text-emerald-300" : "text-warm"
                  }`}
                >
                  {item.quantity < 0
                    ? `+${Math.abs(item.quantity)}`
                    : `x${item.quantity}`}
                </div>
              ) : (
                <div className="text-sm font-semibold text-warm-muted">—</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
