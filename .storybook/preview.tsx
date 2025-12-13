// .storybook/preview.tsx
import "../app/globals.css";
import type { Preview, Decorator } from "@storybook/react";

const withRaiderPalShell: Decorator = (Story) => (
  <>
    {/* Storybook-only override so the texture sits BEHIND the content */}
    <style>
      {`
        body::before {
          z-index: -1 !important;
        }
      `}
    </style>

    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-off-white)]">
      <div className="relative min-h-screen flex flex-col z-0">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="mx-auto max-w-6xl">
            <Story />
          </div>
        </main>
      </div>
    </div>
  </>
);

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withRaiderPalShell],
};

export default preview;
