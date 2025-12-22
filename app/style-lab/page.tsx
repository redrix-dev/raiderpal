// app/design-system/page.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

/**
 * DESIGN SYSTEM REFERENCE PAGE
 * 
 * This page demonstrates EVERY pattern used across Raider Pal.
 * Use this as the source of truth when building or refactoring components.
 * 
 * Token Philosophy:
 * - surface-base (#0f1005) = DARK - headers, footers, UI chrome only
 * - surface-panel (#ece2d0) = LIGHT CREAM - main content areas, inputs
 * - surface-card (#f5ede0) = LIGHTER CREAM - cards, nested content
 * 
 * Text Philosophy:
 * - text-primary / text-muted = ON LIGHT BACKGROUNDS
 * - text-primary-invert / text-muted-invert = ON DARK BACKGROUNDS
 */

export default function DesignSystemPage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"tab1" | "tab2">("tab1");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      {/* ===== PAGE HEADER (no wrapper) ===== */}
      <div>
        <h1 className="text-3xl font-bold font-condensed uppercase tracking-wide text-primary">
          Design System Reference
        </h1>
        <p className="mt-2 text-base text-primary">
          Every UI pattern used in Raider Pal, demonstrated in one place.
          Use this page as your source of truth when building features.
        </p>
      </div>

      {/* ===== TOKEN REFERENCE ===== */}
      <Card>
        <h2 className="text-xl font-semibold font-condensed uppercase tracking-wide text-primary mb-4">
          Color Tokens
        </h2>
        
        <div className="space-y-4">
          {/* Surface tokens */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">Surface Tokens</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="text-xs text-muted mb-1 font-mono">surface-base</div>
                <div 
                  className="h-16 rounded border border-border-subtle p-2 flex items-end"
                  style={{ backgroundColor: 'var(--color-surface-base)' }}
                >
                  <span className="text-xs text-primary-invert">#0f1005 (dark)</span>
                </div>
                <div className="text-[10px] text-muted mt-1">Headers, footers, chrome</div>
              </div>

              <div>
                <div className="text-xs text-muted mb-1 font-mono">surface-panel</div>
                <div 
                  className="h-16 rounded border border-border-subtle p-2 flex items-end"
                  style={{ backgroundColor: 'var(--color-surface-panel)' }}
                >
                  <span className="text-xs text-primary">#ece2d0 (cream)</span>
                </div>
                <div className="text-[10px] text-muted mt-1">Main content, inputs</div>
              </div>

              <div>
                <div className="text-xs text-muted mb-1 font-mono">surface-card</div>
                <div 
                  className="h-16 rounded border border-border-subtle p-2 flex items-end"
                  style={{ backgroundColor: 'var(--color-surface-card)' }}
                >
                  <span className="text-xs text-primary">#f5ede0 (lighter)</span>
                </div>
                <div className="text-[10px] text-muted mt-1">Cards, nested content</div>
              </div>
            </div>
          </div>

          {/* Brand tokens */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">Brand Tokens</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted mb-1 font-mono">brand-cyan</div>
                <div className="h-12 rounded bg-brand-cyan flex items-center justify-center text-sm font-semibold text-white">
                  Interactive elements, links
                </div>
              </div>
              <div>
                <div className="text-xs text-muted mb-1 font-mono">brand-amber</div>
                <div className="h-12 rounded bg-brand-amber flex items-center justify-center text-sm font-semibold text-black">
                  CTA buttons, accents
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ===== BUTTONS ===== */}
      <Card>
        <h2 className="text-xl font-semibold font-condensed uppercase tracking-wide text-primary mb-4">
          Buttons
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">Primary Actions (Brand Cyan)</h3>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-md border border-brand-cyan/40 bg-brand-cyan/10 px-4 py-2 text-sm font-medium text-brand-cyan hover:bg-brand-cyan/15 focus:outline-none focus:ring-1 focus:ring-brand-cyan">
                Primary Action
              </button>
              <button className="rounded-md border border-brand-cyan/70 bg-brand-cyan/15 px-4 py-2 text-sm font-semibold text-brand-cyan hover:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan">
                Emphasized Primary
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">Call-to-Action (Brand Amber)</h3>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-md border border-brand-amber/60 bg-brand-amber px-4 py-2 text-sm font-semibold text-black hover:bg-brand-amber/90 focus:outline-none focus:ring-1 focus:ring-brand-cyan">
                Go to Feature
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">Destructive Actions (Red)</h3>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/15 focus:outline-none focus:ring-1 focus:ring-red-500">
                Delete
              </button>
              <button className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-200 hover:bg-red-500/15 focus:outline-none focus:ring-1 focus:ring-red-500">
                Remove
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">Neutral Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-md border border-border-strong bg-surface-panel px-4 py-2 text-sm font-medium text-primary hover:border-border-subtle focus:outline-none focus:ring-1 focus:ring-brand-cyan">
                Cancel
              </button>
              <button className="rounded-md border border-border-strong bg-surface-panel px-4 py-2 text-sm font-medium text-primary opacity-50 cursor-not-allowed" disabled>
                Disabled
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* ===== FORM INPUTS ===== */}
      <Card>
        <h2 className="text-xl font-semibold font-condensed uppercase tracking-wide text-primary mb-4">
          Form Inputs
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Text Input
            </label>
            <input
              type="text"
              placeholder="Name, type, or loot area"
              className="w-full h-10 rounded-md border border-border-strong bg-surface-panel px-3 text-base text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand-cyan hover:border-brand-cyan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Dropdown / Select
            </label>
            <select className="w-full h-10 rounded-md border border-border-strong bg-surface-panel px-3 text-base text-primary focus:outline-none focus:ring-1 focus:ring-brand-cyan hover:border-brand-cyan">
              <option>All rarities</option>
              <option>Common</option>
              <option>Uncommon</option>
              <option>Rare</option>
              <option>Epic</option>
              <option>Legendary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Textarea
            </label>
            <textarea
              rows={3}
              placeholder="Add a note or comment"
              className="w-full rounded-md border border-border-strong bg-surface-panel px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand-cyan"
            />
          </div>
        </div>
      </Card>

      {/* ===== CARDS & PANELS ===== */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold font-condensed uppercase tracking-wide text-primary">
          Cards & Panels
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold font-condensed text-primary mb-2">
              Standard Card
            </h3>
            <p className="text-sm text-primary">
              This is the default Card component. Light cream background (surface-card),
              dark text (text-primary), subtle border.
            </p>
            <div className="mt-3">
              <button className="rounded-md border border-brand-cyan/40 bg-brand-cyan/10 px-3 py-1.5 text-xs font-medium text-brand-cyan">
                Action
              </button>
            </div>
          </Card>

          <Panel variant="light" padding="base">
            <h3 className="text-lg font-semibold font-condensed text-primary mb-2">
              Light Panel
            </h3>
            <p className="text-sm text-primary">
              Panel with &quot;light&quot; variant. Uses surface-card background.
              Good for standalone content sections.
            </p>
          </Panel>
        </div>

        {/* Nested cards demo */}
        <Card>
          <h3 className="text-lg font-semibold font-condensed text-primary mb-3">
            Nested Cards (Card inside Card)
          </h3>
          <div className="space-y-3">
            <div className="rounded-lg border border-border-subtle bg-surface-panel p-3">
              <div className="text-sm font-semibold text-primary">Nested card #1</div>
              <div className="text-xs text-muted mt-1">
                This uses surface-panel to contrast with the parent&apos;s surface-card
              </div>
            </div>
            <div className="rounded-lg border border-border-subtle bg-surface-panel p-3">
              <div className="text-sm font-semibold text-primary">Nested card #2</div>
              <div className="text-xs text-muted mt-1">
                Same pattern - always alternate between surface-card and surface-panel
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ===== ITEM CARD PATTERN ===== */}
      <Card>
        <h2 className="text-xl font-semibold font-condensed uppercase tracking-wide text-primary mb-4">
          Item Cards (Rarity Colors)
        </h2>
        
        <div className="space-y-3">
          {/* Common */}
          <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-card/70 px-3 py-2.5 hover:border-brand-cyan/70 hover:bg-surface-panel transition-colors">
            <div className="h-9 w-9 rounded border border-border-subtle bg-surface-base" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-condensed font-semibold text-primary">Common Item</span>
                <span className="text-[10px] uppercase tracking-wide border rounded px-1.5 py-0.5 bg-surface-card font-condensed border-border-subtle text-primary">
                  Common
                </span>
              </div>
              <div className="text-[11px] text-muted">Type • Location</div>
            </div>
          </div>

          {/* Rare */}
          <div className="flex items-center gap-3 rounded-lg border border-brand-cyan/70 bg-rarity-rare/40 px-3 py-2.5 hover:border-brand-cyan hover:bg-surface-panel transition-colors">
            <div className="h-9 w-9 rounded border border-border-subtle bg-surface-base" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-condensed font-semibold text-primary">Rare Item</span>
                <span className="text-[10px] uppercase tracking-wide border rounded px-1.5 py-0.5 bg-surface-card font-condensed border-brand-cyan/70 text-primary">
                  Rare
                </span>
              </div>
              <div className="text-[11px] text-muted">Type • Location</div>
            </div>
          </div>

          {/* Legendary */}
          <div className="flex items-center gap-3 rounded-lg border border-rarity-legendary/80 bg-rarity-legendary/40 px-3 py-2.5 hover:border-rarity-legendary hover:bg-surface-panel transition-colors">
            <div className="h-9 w-9 rounded border border-border-subtle bg-surface-base" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-condensed font-semibold text-primary">Legendary Item</span>
                <span className="text-[10px] uppercase tracking-wide border rounded px-1.5 py-0.5 bg-surface-card font-condensed border-rarity-legendary/80 text-primary">
                  Legendary
                </span>
              </div>
              <div className="text-[11px] text-muted">Type • Location</div>
            </div>
          </div>
        </div>
      </Card>

      {/* ===== TABS PATTERN ===== */}
      <Card>
        <h2 className="text-xl font-semibold font-condensed uppercase tracking-wide text-primary mb-4">
          Tabs
        </h2>
        
        <div className="border-b border-border-subtle">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab("tab1")}
              className={`px-4 py-2 text-sm font-medium font-condensed uppercase tracking-wide border-b-2 transition-colors ${
                selectedTab === "tab1"
                  ? "border-brand-cyan text-brand-cyan"
                  : "border-transparent text-muted hover:text-primary"
              }`}
            >
              Tab One
            </button>
            <button
              onClick={() => setSelectedTab("tab2")}
              className={`px-4 py-2 text-sm font-medium font-condensed uppercase tracking-wide border-b-2 transition-colors ${
                selectedTab === "tab2"
                  ? "border-brand-cyan text-brand-cyan"
                  : "border-transparent text-muted hover:text-primary"
              }`}
            >
              Tab Two
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg border border-border-subtle bg-surface-panel">
          {selectedTab === "tab1" ? (
            <div className="text-sm text-primary">
              Content for Tab One. This demonstrates the tab pattern used in item details.
            </div>
          ) : (
            <div className="text-sm text-primary">
              Content for Tab Two. Note the cyan active state and subtle hover transitions.
            </div>
          )}
        </div>
      </Card>

      {/* ===== DARK CHROME EXAMPLE ===== */}
      <div className="rounded-xl border border-border-strong overflow-hidden">
        <div 
          className="px-6 py-4 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-base)',
            backgroundImage: 'url("/backgrounds/ARC_Raiders_Module_Background.png")',
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            backgroundPosition: 'center'
          }}
        >
          <div>
            <h2 className="text-lg font-semibold font-condensed uppercase tracking-wide text-primary-invert">
              Dark Chrome Header
            </h2>
            <p className="text-sm text-muted-invert">
              This uses surface-base with the Embark texture
            </p>
          </div>
          <button className="rounded-md border border-brand-cyan/40 bg-brand-cyan/10 px-3 py-1.5 text-xs font-medium text-brand-cyan hover:bg-brand-cyan/15">
            Action
          </button>
        </div>
        
        <div className="bg-surface-card p-6">
          <div className="text-sm text-primary">
            Light content area below the dark header. This is the pattern for:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Site header + main content</li>
              <li>Modal headers + modal body</li>
              <li>Sidebar headers + sidebar content</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===== TYPOGRAPHY ===== */}
      <Card>
        <h2 className="text-xl font-semibold font-condensed uppercase tracking-wide text-primary mb-4">
          Typography
        </h2>
        
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold font-condensed uppercase tracking-wide text-primary">
              Page Title (h1)
            </h1>
            <code className="text-xs text-muted">text-3xl font-bold font-condensed uppercase</code>
          </div>

          <div>
            <h2 className="text-xl font-semibold font-condensed uppercase tracking-wide text-primary">
              Section Title (h2)
            </h2>
            <code className="text-xs text-muted">text-xl font-semibold font-condensed uppercase</code>
          </div>

          <div>
            <p className="text-base text-primary">
              Body text uses text-base with text-primary color. This is readable on all
              light backgrounds (surface-panel, surface-card).
            </p>
            <code className="text-xs text-muted">text-base text-primary</code>
          </div>

          <div>
            <p className="text-sm text-muted">
              Muted text for descriptions and secondary information.
            </p>
            <code className="text-xs text-muted">text-sm text-muted</code>
          </div>

          <div>
            <span className="text-xs text-muted">
              Small text for labels and metadata.
            </span>
            <br />
            <code className="text-xs text-muted">text-xs text-muted</code>
          </div>
        </div>
      </Card>

      {/* ===== RULES SUMMARY ===== */}
      <Card className="border-2 border-brand-cyan/40 bg-brand-cyan/5">
        <h2 className="text-xl font-semibold font-condensed uppercase tracking-wide text-primary mb-4">
          Golden Rules
        </h2>
        
        <ul className="space-y-3 text-sm text-primary">
          <li className="flex items-start gap-2">
            <span className="text-brand-cyan">✓</span>
            <span><strong>Dark chrome (surface-base)</strong> = headers, footers, navigation, sidebars</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-cyan">✓</span>
            <span><strong>Light content (surface-panel/card)</strong> = main content, cards, forms</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-cyan">✓</span>
            <span><strong>Brand cyan</strong> = primary actions, links, active states</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-cyan">✓</span>
            <span><strong>Brand amber</strong> = CTAs, important buttons</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-cyan">✓</span>
            <span><strong>Rarity colors</strong> = item cards backgrounds only (with opacity)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-cyan">✓</span>
            <span><strong>Text on light backgrounds</strong> = text-primary / text-muted</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-cyan">✓</span>
            <span><strong>Text on dark backgrounds</strong> = text-primary-invert / text-muted-invert</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400">✗</span>
            <span><strong>Never</strong> use hardcoded Tailwind colors (slate-, gray-, etc)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400">✗</span>
            <span><strong>Never</strong> use dark purple texture on content cards</span>
          </li>
        </ul>
      </Card>
    </main>
  );
}
