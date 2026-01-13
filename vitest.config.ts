import { defineConfig, configDefaults } from "vitest/config";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": rootDir,
    },
  },

  test: {
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
  },
});
