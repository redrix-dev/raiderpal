import type { ReactNode } from "react";
import Image from "next/image";
import { Panel, PanelVariant } from "@/components/ui/Panel";

export type ModulePanelRow = {
  key: string;
  label: ReactNode;
  value?: ReactNode;
  icon?: string | null;
  href?: string;
};

type ModulePanelProps = {
  title: ReactNode;
  subtitle?: ReactNode; // ✅ THIS FIXES YOUR ERROR
  rows?: ModulePanelRow[];
  children?: ReactNode;

  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string;
  headerRight?: ReactNode;
};

export function ModulePanel({
  title,
  subtitle,
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
      variant="light"
      padding="none"
      className={`h-full w-full text-base overflow-hidden ${className}`}
    >
      {/* Header */}
      <div
        className={
          "bg-black/50 border-b border-white/10 px-6 md:px-7 py-4  " +
          "2xl:[.ui-compact_&]:px-5 2xl:[.ui-compact_&]:py-3 " +
          headerClassName
        }
        style={{
              backgroundImage:
                'url("/backgrounds/ARC_Raiders_Module_Background.png")',
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              backgroundPosition: "center",
            }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl 2xl:[.ui-compact_&]:text-xl font-condensed font-semibold text-primary-invert uppercase tracking-wide truncate">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted-invert">{subtitle}</p>
            ) : null}
          </div>

          {headerRight ? (
            <div className="flex-shrink-0">{headerRight}</div>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div
        className={
          "px-6 py-6 space-y-3 " +
          "2xl:[.ui-compact_&]:px-5 2xl:[.ui-compact_&]:py-4 2xl:[.ui-compact_&]:space-y-2.5 " +
          bodyClassName
        }
      >
        {rows.length > 0
          ? rows.map((row) => {
              const content = (
                <div className="flex items-center gap-3 min-w-0">
                  {row.icon ? (
                    <Image
                      src={row.icon}
                      alt={typeof row.label === "string" ? row.label : "Icon"}
                      width={40}
                      height={40}
                      sizes="40px"
                      loading="lazy"
                      className="h-10 w-10 rounded border border-white/10 bg-black/60 object-contain flex-shrink-0"
                    />
                  ) : null}
                  <dt className="text-muted-invert font-semibold truncate">
                    {row.label}
                  </dt>
                </div>
              );

              return (
                <div
                  key={row.key}
                  className={
                    "flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/20 px-6 py-4 text-base " +
                    "2xl:[.ui-compact_&]:px-5 2xl:[.ui-compact_&]:py-3 2xl:[.ui-compact_&]:text-sm " +
                    rowClassName
                  }
                >
                  {row.href ? (
                    <a
                      href={row.href}
                      className="flex items-center gap-3 min-w-0 text-primary-invert hover:underline"
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                  {row.value != null ? (
                    <dd className="font-semibold text-primary-invert text-right truncate">
                      {row.value}
                    </dd>
                  ) : null}
                </div>
              );
            })
          : children}
      </div>
    </Panel>
  );
}
