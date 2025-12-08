// components/ItemStatsPanel.tsx
import { ModulePanel, type ModulePanelRow } from "./ModulePanel";

type ItemStatsPanelProps = {
  value?: number | null;
  itemType?: string | null;
  workbench?: string | null;
  lootArea?: string | null;
};

export function ItemStatsPanel({
  value,
  itemType,
  workbench,
  lootArea,
}: ItemStatsPanelProps) {
  const rows: ModulePanelRow[] = [];

  if (value != null) {
    rows.push({
      key: "value",
      label: "Value",
      value,
    });
  }

  if (itemType) {
    rows.push({
      key: "type",
      label: "Type",
      value: itemType,
    });
  }

  if (workbench) {
    rows.push({
      key: "workbench",
      label: "Workbench",
      value: workbench,
    });
  }

  if (lootArea) {
    rows.push({
      key: "lootArea",
      label: "Loot Area",
      value: lootArea,
    });
  }

  return <ModulePanel title="Stats" rows={rows} />;
}
