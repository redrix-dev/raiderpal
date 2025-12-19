// components/TopNavMenu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LongCacheSettingsModal } from "./LongCacheToggle";

const links = [
  { label: "Home", href: "/" },
  { label: "Item Browser", href: "/items/browse" },
  { label: "Recycle Helper", href: "/recycle-helper" },
  { label: "Repair or Replace Calculator", href: "/repair-calculator" },
  { label: "Repair & Recycle Breakdown", href: "/repair-breakdown" },
];

export function TopNavMenu() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close when clicking outside or pressing escape
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

  // Position the menu relative to the trigger; use fixed + portal to escape stacking contexts
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-strong bg-surface-base/60 text-text-primary transition hover:border-border-subtle hover:bg-surface-base focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-surface-base"
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] w-56"
            style={{ top: menuPosition.top, right: menuPosition.right }}
          >
            <div className="overflow-hidden rounded-lg border border-border-strong bg-panel-texture shadow-2xl backdrop-blur text-text-primary">
              <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Navigation
              </div>
              <div className="pb-2">
                {links.map((link) => {
                  const active =
                    link.href === "/"
                      ? pathname === link.href
                      : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2 text-sm transition ${
                        active
                          ? "bg-surface-base text-text-primary"
                          : "text-text-primary hover:bg-surface-base hover:text-text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-border-subtle pt-3 pb-4 space-y-2">
                <div className="px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Settings
                </div>
                <button
                  type="button"
                  onClick={handleOpenSettings}
                  className="block w-full text-left rounded-md px-4 py-2 text-sm text-text-primary transition hover:bg-surface-base focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-surface-base"
                >
                  Long Term Caching
                </button>
              </div>
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
