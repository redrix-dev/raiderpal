import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import type { StorybookConfig } from "@storybook/nextjs-vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {
      nextConfigPath: resolve(__dirname, "../next.config.ts"),
    },
  },
  staticDirs: [{ from: resolve(__dirname, "../public"), to: "/" }],
  viteFinal: async (config) => ({
    ...config,
    css: {
      ...(config.css ?? {}),
      postcss: resolve(__dirname, "../postcss.config.mjs"),
    },
    resolve: {
      ...(config.resolve ?? {}),
      alias: {
        ...(config.resolve?.alias ?? {}),
        "@": resolve(__dirname, ".."),
      },
    },
  }),
};

export default config;
