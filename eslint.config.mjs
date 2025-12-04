import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "eslint/config";

const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
});

export default defineConfig([
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
]);
