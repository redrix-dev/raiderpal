// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { HeaderControls } from "@/components/HeaderControls";
import { Barlow, Barlow_Condensed } from "next/font/google";

const barlow = Barlow({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

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
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full`}
    >
      <body className="relative min-h-full bg-[var(--color-bg)] text-[var(--color-off-white)]">
        <div className="relative min-h-screen flex flex-col" style={{ zIndex: 2 }}>
          {/* Header */}
          <header
            className="border-b border-slate-800 bg-[#050910]/95 backdrop-blur"
            style={{
              backgroundImage: 'url("/backgrounds/ARC_Raiders_Module_Background.png")',
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              backgroundPosition: "center",
            }}
          >
            <div className="mx-auto w-full max-w-[1680px] 2xl:max-w-[1800px] px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded bg-[#4fc1e9]/20 border border-[#4fc1e9]/40 flex items-center justify-center text-base font-semibold">
                  RP
                </div>
                <div className="hidden sm:flex flex-col">
                  <h1 className="text-xl font-bold tracking-wide uppercase font-condensed text-center sm:text-left">
                    Raider Pal
                  </h1>
                  <p className="text-sm text-warm-muted text-center sm:text-left font-medium">
                    Arc Raiders item explorer & crafting companion
                  </p>
                </div>
              </div>

              <HeaderControls />
            </div>
            <div className="h-1 w-full bg-[var(--color-yellow)]" />
          </header>

          {/* Main */}
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1680px] 2xl:max-w-[1800px] px-3 sm:px-5 lg:px-8 py-5">
              <div className="min-w-0">{children}</div>
            </div>
          </main>
          <Analytics />

          {/* Footer stripe accent */}
          <div
            className="w-full h-3 md:h-4"
            style={{
              backgroundImage: 'url("/branding/stripe.png")',
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% auto",
              backgroundPosition: "center",
            }}
            aria-hidden
          />

          {/* Footer */}
          <footer
            className="border-t border-slate-800 bg-[#050910]"
            style={{
              backgroundImage: 'url("/backgrounds/ARC_Raiders_Module_Background.png")',
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              backgroundPosition: "center",
            }}
          >
            <div className="mx-auto w-full max-w-[1680px] 2xl:max-w-[1800px] px-6 lg:px-8 py-4 text-sm text-warm-muted flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-warm-muted">
                Raider Pal — an unofficial Arc Raiders companion. Game data and assets are © Embark Studios AB, with item information sourced from MetaForge (
                <a
                  href="https://metaforge.app/arc-raiders"
                  className="text-[#4fc1e9] hover:text-[#4fc1e9]"
                >
                  metaforge.app/arc-raiders
                </a>
                ). “Arc Raiders” and its associated trademarks are owned by Embark Studios AB.
              </span>
              <span className="text-warm-muted">Built with Next.js & Supabase</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
