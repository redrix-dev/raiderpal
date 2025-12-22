"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LongCacheSettingsModal } from "@/components/rp/LongCacheToggle";

const links = [
  { label: "Home", href: "/" },
  { label: "Item Browser", href: "/item-browser" },
  { label: "Repair or Replace Calculator", href: "/repair-calculator" },
];

export function TopNavMenu() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (showSettings) return;
      const target = event.target as Node;
      const inTrigger = containerRef.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inTrigger && !inMenu) setOpen(false);
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [showSettings]);

  useEffect(() => {
    function updatePosition() {
      if (!open || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpen(false);
        return;
      }
      setMenuPosition({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    updatePosition();
    if (open) {
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [open]);

  function handleToggleMenu() {
    setShowSettings(false);
    setOpen((prev) => !prev);
  }

  function handleOpenSettings() {
    setShowSettings(true);
    setOpen(false);
  }

  return (
    <>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={handleToggleMenu}
          aria-expanded={open}
          aria-label="Toggle navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-strong bg-surface-base/70 text-primary-invert transition hover:border-brand-cyan/60 hover:bg-surface-base/90 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-surface-base"
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] w-60"
            style={{ top: menuPosition.top, right: menuPosition.right }}
          >
            <div>
              <SectionHeader
                contentClassName="px-4 py-2 sm:px-4 sm:py-2"
                className="rounded-t-lg"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-invert">
                  Navigation
                </div>
              </SectionHeader>
              <Card className="border-border-strong rounded-t-none border-t-0 !p-0 text-primary shadow-2xl">
                <div className="pb-2">
                  {links.map((link) => {
                    const active = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`block px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? "bg-surface-panel text-primary"
                            : "text-primary hover:bg-surface-panel"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-border-subtle pb-4">
                  <CardHeader
                    className="border-0 border-b border-border-subtle rounded-none"
                    contentClassName="px-4 py-2 sm:px-4 sm:py-2"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-invert">
                      Settings
                    </div>
                  </CardHeader>
                  <button
                    type="button"
                    onClick={handleOpenSettings}
                    className="mt-2 block w-full text-left px-4 py-2 text-sm font-semibold text-primary transition hover:bg-surface-panel focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-surface-card"
                  >
                    Long Term Caching
                  </button>
                </div>
              </Card>
            </div>
          </div>,
          document.body
        )}

      <LongCacheSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <div className="relative h-4 w-5">
      <span
        className={`absolute left-0 block h-[2px] w-full origin-center rounded bg-current transition-transform ${
          open ? "translate-y-[6px] rotate-45" : "translate-y-0"
        }`}
      />
      <span
        className={`absolute left-0 block h-[2px] w-full origin-center rounded bg-current transition-opacity ${
          open ? "opacity-0" : "opacity-100"
        }`}
        style={{ top: "6px" }}
      />
      <span
        className={`absolute left-0 block h-[2px] w-full origin-center rounded bg-current transition-transform ${
          open ? "translate-y-[6px] -rotate-45" : "translate-y-[12px]"
        }`}
      />
    </div>
  );
}
