"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * PWA Install Prompt Component
 * 
 * Shows a custom install prompt when the PWA is installable.
 * This is an optional enhancement - browsers show install prompts automatically,
 * but a custom prompt can improve conversion rates.
 * 
 * Only shows when:
 * - PWA is installable (beforeinstallprompt event fired)
 * - User hasn't dismissed it (stored in localStorage)
 * - Not already installed
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50">
      <div className="bg-surface-panel border border-border-strong rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-primary mb-1">Install Raider Pal</h3>
            <p className="text-sm text-muted">
              Install Raider Pal for quick access and offline support.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={handleInstall}
              variant="cta"
              className="px-3 py-1.5 text-xs"
            >
              Install
            </Button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-muted hover:text-primary"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Type definition for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

