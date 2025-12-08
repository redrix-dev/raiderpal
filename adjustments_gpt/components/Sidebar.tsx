// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const inItems = pathname.startsWith("/items");

  return (
    <aside className="hidden md:block w-60 flex-shrink-0">
      <div className="sticky top-4 space-y-4 rounded-lg border border-slate-800 bg-panel-texture p-3 text-sm">
        {/* Main nav */}
        <div>
          <h2 className="text-xs font-semibold text-warm uppercase tracking-wide mb-2">
            Navigation
          </h2>
          <nav className="space-y-1 text-xs">
            <Link
              href="/"
              className="block rounded px-2 py-1 text-warm hover:bg-slate-900"
            >
              Home
            </Link>
            <Link
              href="/items/browse"
              className="block rounded px-2 py-1 text-warm hover:bg-slate-900"
            >
              Browse items
            </Link>
            <Link
              href="/items"
              className="block rounded px-2 py-1 text-warm-muted hover:bg-slate-900"
            >
              Dev item list
            </Link>
          </nav>
        </div>

        {/* Context-aware section */}
        {inItems && (
          <div>
            <h3 className="text-xs font-semibold text-warm uppercase tracking-wide mb-2">
              Items
            </h3>
            <ul className="space-y-1 text-xs text-warm-muted">
              <li>515 items loaded</li>
              <li>Crafting & recycling mapped</li>
              {/* later: favorites, recent items, filters, etc. */}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
