"use client";

import { useEffect } from "react";

/**
 * PWA Service Worker Registration Component
 * 
 * Registers the service worker for PWA functionality (offline support, caching).
 * Only runs in the browser and gracefully degrades if service worker is unavailable.
 */
export function PWARegistration() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Only register in production (service worker disabled in dev)
    if (process.env.NODE_ENV === "development") return;

    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration.scope);
      })
      .catch((error) => {
        console.warn("Service Worker registration failed:", error);
      });
  }, []);

  // This component doesn't render anything
  return null;
}

