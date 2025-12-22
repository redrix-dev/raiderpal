/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./stories/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    colors: {
      // Brand colors
      brand: {
        cyan: "#4fc1e9",
        amber: "#f1aa1c",
      },

      // Rarity colors (for item cards)
      rarity: {
        common: "#6c6c6c",
        uncommon: "#25bf56",
        rare: "#00a9f2",
        epic: "#cc3099",
        legendary: "#ffc600",
      },

      // Text colors
      text: {
        primary: "#130918",        // Dark text for light backgrounds
        muted: "#2a212f",          // Muted dark text for light backgrounds
        "primary-invert": "#ece2d0", // Light text for dark backgrounds
        "muted-invert": "#ccc3b3",   // Muted light text for dark backgrounds
      },

      // Surface colors
      surface: {
        base: "#0f1005",   // Dark - for headers, footers, UI chrome
        panel: "#ece2d0",  // Light cream - for main content areas, inputs
        card: "#f5ede0",   // Lighter cream - for cards, nested content
      },

      // Border colors
      border: {
        strong: "#130918",                    // Solid dark border
        subtle: "rgba(255, 255, 255, 0.06)",  // Translucent light border
      },
    },

    fontFamily: {
      sans: [
        'var(--font-barlow, "Barlow", system-ui, -apple-system, "Segoe UI", sans-serif)',
      ],
      condensed: [
        'var(--font-barlow-condensed, "Barlow Condensed", "Barlow", system-ui, -apple-system, "Segoe UI", sans-serif)',
      ],
    },
  },
  plugins: [],
};
