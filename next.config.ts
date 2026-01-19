import type { NextConfig } from "next";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

type RemotePatterns = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>;

const remotePatterns: RemotePatterns = [
  {
    protocol: "https",
    hostname: "cdn.metaforge.app",
  },
];

if (supabaseHost) {
  remotePatterns.push({
    protocol: "https",
    hostname: supabaseHost,
  });
}

const baseConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

// PWA configuration - disabled in development to avoid caching issues
// Note: next-pwa may have compatibility issues with Next.js 15
// If issues arise, consider using a custom service worker approach
const isDev = process.env.NODE_ENV === "development";

let nextConfig: NextConfig = baseConfig;

if (!isDev) {
  try {
    const withPWA = require("next-pwa")({
      dest: "public",
      register: true,
      skipWaiting: true,
      disable: isDev,
      fallbacks: {
        document: "/offline.html",
      },
      runtimeCaching: [
        {
          urlPattern: /^https?.*/,
          handler: "NetworkFirst",
          options: {
            cacheName: "offlineCache",
            expiration: {
              maxEntries: 200,
            },
          },
        },
      ],
    });
    nextConfig = withPWA(baseConfig);
  } catch (error) {
    // If next-pwa fails, use base config without PWA
    console.warn("next-pwa configuration failed, continuing without PWA:", error);
    nextConfig = baseConfig;
  }
}

export default nextConfig;
