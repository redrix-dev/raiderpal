// components/ModulePanel.tsx
import Image from "next/image";
import type { ReactNode } from "react";
import { Panel } from "./ui/Panel";

export type ModulePanelRow = {
  key: string;
  label: ReactNode;
  value?: ReactNode;
  icon?: string | null;
  href?: string;
};

type ModulePanelProps = {
  title: string;
  rows?: ModulePanelRow[];
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string;
  headerRight?: ReactNode;
};

/**
 * Reusable panel with the same shell/row styling used on stats and tabs.
 * Keeps page-level usage minimal: supply a title and rows.
 */
export function ModulePanel({
  title,
  rows = [],
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  rowClassName = "",
  headerRight,
}: ModulePanelProps) {
  return (
    <Panel
      padding="none"
      className={`h-full w-full overflow-hidden text-base ${className}`}
    >
      <div
        className={
          "bg-black/50 border-b border-white/10 px-6 md:px-7 py-4 2xl:[.ui-compact_&]:px-5 2xl:[.ui-compact_&]:py-3 " +
          headerClassName
        }
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl 2xl:[.ui-compact_&]:text-xl font-condensed font-semibold text-warm uppercase tracking-wide">
            {title}
          </h2>
          {headerRight}
        </div>
      </div>

      <div
        className={
          "px-6 py-6 space-y-3 2xl:[.ui-compact_&]:px-5 2xl:[.ui-compact_&]:py-4 2xl:[.ui-compact_&]:space-y-2.5 " +
          bodyClassName
        }
      >
        {rows.length > 0
          ? rows.map((row) => {
              const content = (
                <div className="flex items-center gap-3 min-w-0">
                  {row.icon && (
                    <Image
                      src={row.icon}
                      alt={typeof row.label === "string" ? row.label : "Icon"}
                      width={40}
                      height={40}
                      sizes="40px"
                      loading="lazy"
                      className="h-10 w-10 rounded border border-white/10 bg-black/60 object-contain flex-shrink-0"
                    />
                  )}
                  <dt className="text-warm-muted font-semibold truncate">
                    {row.label}
                  </dt>
                </div>
              );

              return (
                <div
                  key={row.key}
                  className={
                    "flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/20 px-6 py-4 text-base 2xl:[.ui-compact_&]:px-5 2xl:[.ui-compact_&]:py-3 2xl:[.ui-compact_&]:text-sm " +
                    rowClassName
                  }
                >
                  {row.href ? (
                    <a href={row.href} className="flex items-center gap-3 min-w-0 text-warm hover:underline">
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                  {row.value != null && (
                    <dd className="font-semibold text-warm text-right truncate">
                      {row.value}
                    </dd>
                  )}
                </div>
              );
            })
          : children}
      </div>
    </Panel>
  );
}

