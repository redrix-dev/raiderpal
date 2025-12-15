/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./stories/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    colors: {
      brand: {
        cyan: "#4fc1e9",
        amber: "#f1aa1c",
      },
      text: {
        primary: "#e3ddd4",
        muted: "#8ea0b8",
      },
      surface: {
        base: "#050910",
        panel: "#130918",
        card: "#07040f",
      },
      border: {
        strong: "#130918",
        subtle: "rgba(255, 255, 255, 0.06)",
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
