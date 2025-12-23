// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { HeaderControls } from "@/components/rp/HeaderControls";
import { CacheDebugPanel } from "@/components/CacheDebugPanel";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Raider Pal",
    template: "%s | Raider Pal",
  },
  description: "Arc Raiders item browser, crafting, and recycling tool.",
  openGraph: {
    title: "Raider Pal",
    description: "Arc Raiders item browser, crafting, and recycling tool.",
    url: "/",
    siteName: "Raider Pal",
    images: [
      {
        url: "/backgrounds/ARC_Raiders_Module_Background.png",
        alt: "Raider Pal",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raider Pal",
    description: "Arc Raiders item browser, crafting, and recycling tool.",
    images: ["/backgrounds/ARC_Raiders_Module_Background.png"],
  },
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
      <body className="relative min-h-full bg-surface-base text-primary font-sans">
        {/* App stacking root: ensures ALL UI sits above body pseudo-element wallpaper layers */}
        <div id="app-root" className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header
            className="border-b border-border-strong bg-surface-base/100"
            style={{
              backgroundImage:
                'url("/backgrounds/ARC_Raiders_Module_Background.png")',
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              backgroundPosition: "center",
            }}
          >
            <div className="mx-auto w-full max-w-[1680px] 2xl:max-w-[1800px] px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded bg-[#4fc1e9]/20 border border-[#4fc1e9]/40 flex items-center justify-center text-primary-invert font-semibold">
                  RP
                </div>
                <div className="hidden sm:flex flex-col">
                  <h1 className="text-xl font-bold tracking-wide uppercase font-condensed text-center text-primary-invert sm:text-left">
                    Raider Pal
                  </h1>
                  <p className="text-sm text-muted-invert text-center sm:text-left font-medium">
                    Arc Raiders item explorer & crafting companion
                  </p>
                </div>
              </div>

              <HeaderControls />
            </div>
            <div className="h-1 w-full bg-brand-amber" />
          </header>

          {/* Main */}
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1680px] 2xl:max-w-[1800px] px-3 sm:px-5 lg:px-8 py-5">
              <div className="min-w-0">{children}</div>
            </div>
          </main>

          {process.env.NODE_ENV === "development" && <CacheDebugPanel />}
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
              backgroundImage:
                'url("/backgrounds/ARC_Raiders_Module_Background.png")',
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              backgroundPosition: "center",
            }}
          >
            <div className="mx-auto w-full max-w-[1680px] 2xl:max-w-[1800px] px-6 lg:px-8 py-4 text-sm text-muted-invert flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-invert">
                Raider Pal — an unofficial Arc Raiders companion. Game data and
                assets are © Embark Studios AB, with item information sourced
                from MetaForge (
                <a
                  href="https://metaforge.app/arc-raiders"
                  className="text-[#4fc1e9] hover:text-[#4fc1e9]"
                >
                  metaforge.app/arc-raiders
                </a>
                ). “Arc Raiders” and its associated trademarks are owned by
                Embark Studios AB.
              </span>
              <span className="text-muted-invert">
                Built with Next.js & Supabase
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
