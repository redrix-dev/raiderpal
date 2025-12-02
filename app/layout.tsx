// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raider Pal",
  description: "Arc Raiders item browser, crafting, and recycling tool.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#050910] text-gray-100">
        {/* App Shell */}
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-slate-800 bg-[#050910]/95 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Simple logo placeholder */}
                <div className="h-8 w-8 rounded bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-xs font-semibold">
                  RP
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">
                    Raider Pal
                  </h1>
                  <p className="text-xs text-gray-400">
                    Arc Raiders item explorer & crafting companion
                  </p>
                </div>
              </div>

              {/* Basic nav (extend later) */}
              <nav className="flex items-center gap-3 text-sm">
                <a
                  href="/items"
                  className="px-3 py-1.5 rounded border border-slate-700 bg-slate-900/60 hover:bg-slate-800 transition-colors"
                >
                  Items
                </a>
                {/* Reserve for future pages:
                <a href="/favorites" className="text-gray-400 hover:text-gray-200">
                  Favorites
                </a>
                <a href="/widget" className="text-gray-400 hover:text-gray-200">
                  Widget
                </a>
                */}
              </nav>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
          </main>

          {/* Footer (minimal for now) */}
          <footer className="border-t border-slate-800 bg-[#050910]">
            <div className="mx-auto max-w-6xl px-4 py-3 text-xs text-gray-500 flex justify-between">
              <span>Raider Pal · Unofficial Arc Raiders companion</span>
              <span>Built with Next.js & Supabase</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
