// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { HeaderControls } from "@/components/HeaderControls";

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
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-slate-800 bg-[#050910]/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
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

              <HeaderControls />
            </div>
          </header>

          {/* Main */}
          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 py-4">
              <div className="min-w-0">{children}</div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800 bg-[#050910]">
            <div className="mx-auto max-w-7xl px-4 py-3 text-xs text-gray-500 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-gray-400">
                Raider Pal — unofficial Arc Raiders companion. All game data is
                property of Embark Studios and provided by MetaForge via{" "}
                <a
                  href="https://metaforge.app/arc-raiders"
                  className="text-sky-300 hover:text-sky-200"
                >
                  metaforge.app/arc-raiders
                </a>
                .
              </span>
              <span className="text-gray-500">Built with Next.js & Supabase</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
