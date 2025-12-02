// components/TopNavMenu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "Item Browser", href: "/items/browse" },
  { label: "Recycle Helper", href: "/recycle-helper" },
];

export function TopNavMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close when clicking outside or pressing escape
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
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
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Toggle navigation"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 bg-slate-900/60 text-gray-100 transition hover:border-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        <MenuIcon open={open} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56">
          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur">
            <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
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
                        ? "bg-slate-900 text-white"
                        : "text-slate-200 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
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
