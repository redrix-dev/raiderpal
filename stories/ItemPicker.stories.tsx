// stories/ItemPicker.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ItemPicker, type PickerItem } from "@/components/ItemPicker";

const meta: Meta<typeof ItemPicker> = {
  title: "Components/ItemPicker",
  component: ItemPicker,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl rounded-xl border border-white/5 bg-panel-texture shadow-[0_0_40px_rgba(0,0,0,0.6)] p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ItemPicker>;

const mockItems: PickerItem[] = [
  {
    id: "spark-rifle",
    name: "Spark Rifle",
    rarity: "Rare",
    subtitle: "Weapon • Max durability: 100",
    icon: "https://cdn.metaforge.app/arc-raiders/icons/spark-rifle.webp",
  },
  {
    id: "guardian-armor",
    name: "Guardian Armor",
    rarity: "Epic",
    subtitle: "Armor",
    icon: "https://cdn.metaforge.app/arc-raiders/icons/guardian-armor.webp",
  },
  {
    id: "mechanical-components",
    name: "Mechanical Components",
    rarity: "Uncommon",
    subtitle: "Refined Material",
    icon: "https://cdn.metaforge.app/arc-raiders/icons/mechanical-components.webp",
  },
];

export const Default: Story = {
  args: {
    items: mockItems,
    selectedId: "spark-rifle",
    placeholder: "Select an item...",
    onChange: (id: string) => {
      console.log("selected:", id);
    },
  },
};

export const Compact: Story = {
  args: {
    ...Default.args,
    triggerClassName: "h-9 text-xs",
  },
};
