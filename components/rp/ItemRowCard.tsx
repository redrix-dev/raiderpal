import Image from "next/image";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { Card } from "@/components/ui/Card";
import { Panel, type PanelVariant } from "@/components/ui/Panel";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { rarityClasses } from "@/components/ui/rarity";
import { cn } from "@/lib/cn";

export type ItemRowCardVariant = "default" | "compact" | "dropdown";
export type ItemRowCardTone = "neutral" | "rarity";

type ItemRowCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  right?: ReactNode;
  icon?: string | null;
  iconAlt?: string;
  rarity?: string | null;
  variant?: ItemRowCardVariant;
  tone?: ItemRowCardTone;
  panelVariant?: PanelVariant;
  showRarityBadge?: boolean;
  interactive?: boolean;
  as?: "div" | "button";
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  metaClassName?: string;
  rightClassName?: string;
  iconClassName?: string;
} & HTMLAttributes<HTMLElement>;

const variantStyles: Record<
  ItemRowCardVariant,
  {
    container: string;
    icon: string;
    title: string;
    meta: string;
  }
> = {
  default: {
    container: "p-3",
    icon: "h-9 w-9",
    title: "text-sm",
    meta: "text-[11px]",
  },
  compact: {
    container: "p-2.5",
    icon: "h-8 w-8",
    title: "text-sm",
    meta: "text-[11px]",
  },
  dropdown: {
    container: "p-2.5",
    icon: "h-[52px] w-[52px]",
    title: "text-sm",
    meta: "text-[11px]",
  },
};

export const ItemRowCard = forwardRef<
  HTMLButtonElement | HTMLDivElement,
  ItemRowCardProps
>(function ItemRowCard(
  {
    title,
    subtitle,
    meta,
    badges,
    right,
    icon,
    iconAlt,
    rarity,
    variant = "default",
    tone = "neutral",
    panelVariant = "light",
    showRarityBadge = true,
    interactive = false,
    as = "div",
    className,
    contentClassName,
    titleClassName,
    subtitleClassName,
    metaClassName,
    rightClassName,
    iconClassName,
    ...rest
  },
  ref
) {
  const variantConfig = variantStyles[variant];
  const toneClass =
    tone === "rarity"
      ? rarityClasses(rarity)
      : "border-border-subtle bg-surface-card/60";
  const rootClassName = cn(
    "w-full text-left",
    interactive &&
      "group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-surface-panel",
    className
  );

  const card = (
    <Card
      variant="neutral"
      padding="xs"
      className={cn(
        "transition-colors",
        toneClass,
        interactive && "group-hover:border-brand-cyan/60"
      )}
    >
      <Panel
        variant={panelVariant}
        padding="none"
        className={cn(
          "flex items-start gap-3",
          variantConfig.container,
          contentClassName
        )}
      >
        {icon ? (
          <Image
            src={icon}
            alt={iconAlt ?? "Item icon"}
            width={52}
            height={52}
            sizes="52px"
            loading="lazy"
            className={cn(
              "rounded border border-border-subtle bg-surface-panel object-contain flex-shrink-0",
              variantConfig.icon,
              iconClassName
            )}
          />
        ) : (
          <div
            className={cn(
              "rounded border border-border-subtle bg-surface-panel flex-shrink-0",
              variantConfig.icon,
              iconClassName
            )}
          />
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "truncate font-condensed font-semibold text-primary",
                variantConfig.title,
                titleClassName
              )}
            >
              {title}
            </span>
            {badges}
            {showRarityBadge && rarity ? <RarityBadge rarity={rarity} /> : null}
          </div>

          {subtitle ? (
            <div className={cn("text-xs text-muted", subtitleClassName)}>
              {subtitle}
            </div>
          ) : null}

            {meta ? (
              <div
                className={cn(
                  "text-muted font-medium",
                  variantConfig.meta,
                  metaClassName
                )}
              >
                {meta}
              </div>
            ) : null}
        </div>

        {right ? (
          <div className={cn("flex-shrink-0", rightClassName)}>{right}</div>
        ) : null}
      </Panel>
    </Card>
  );

  if (as === "button") {
    return (
      <button
        type="button"
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={ref as Ref<HTMLButtonElement>}
        className={rootClassName}
      >
        {card}
      </button>
    );
  }

  return (
    <div
      {...(rest as HTMLAttributes<HTMLDivElement>)}
      ref={ref as Ref<HTMLDivElement>}
      className={rootClassName}
    >
      {card}
    </div>
  );
});
