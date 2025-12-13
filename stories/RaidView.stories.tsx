// stories/RaidView.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { RaidView } from "@/components/RaidView";

const meta: Meta<typeof RaidView> = {
  title: "Components/RaidView",
  component: RaidView,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

type Story = StoryObj<typeof RaidView>;

export const Empty: Story = {
  args: {
    title: "Empty RaidView",
    children: null,
  },
};

export const WithContent: Story = {
  args: {
    title: "RaidView With Content",
    children: (
      <div className="text-sm text-warm-muted">
        This is a placeholder body inside RaidView.
      </div>
    ),
  },
};
