"use client";

import { ReactNode } from "react";
import { ModulePanel } from "@/components/ModulePanel";

type RaidViewProps = {
  children?: ReactNode;
  title?: string;
};

export function RaidView({ children, title }: RaidViewProps) {
  return (
    <ModulePanel title={title ?? ""}>
      {children}
    </ModulePanel>
  );
}
