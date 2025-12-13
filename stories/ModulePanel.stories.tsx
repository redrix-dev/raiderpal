import type { Meta, StoryObj } from "@storybook/react";
import { ModulePanel, type ModulePanelRow } from "@/components/ModulePanel";

const rows: ModulePanelRow[] = [
  {
    key: "spark-rifle",
    label: "Spark Rifle",
    value: "Energy weapon",
    icon: "/next.svg",
  },
  {
    key: "guardian-armor",
    label: "Guardian Armor",
    value: "Epic chest plate",
    icon: "/branding/stripe.png",
  },
  {
    key: "unstable-core",
    label: "Unstable Core",
    value: "High-value drop",
    icon: "/vercel.svg",
  },
];

const meta: Meta<typeof ModulePanel> = {
  title: "Components/ModulePanel",
  component: ModulePanel,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ModulePanel>;

export const Default: Story = {
  args: {
    title: "Module Loadout",
    rows,
  },
};

export const WithContent: Story = {
  args: {
    title: "Module Details",
    children: (
      <div className="space-y-3 text-warm-muted leading-relaxed">
        <p>
          Use this panel to present richer layouts or custom content. It keeps the
          same shell styling and texture as your in-app modules.
        </p>
        <p className="text-sm">
          Swap in your real data, and the global Raider Pal background and fonts will
          remain consistent across stories.
        </p>
      </div>
    ),
  },
};
