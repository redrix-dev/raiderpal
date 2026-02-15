/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
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
