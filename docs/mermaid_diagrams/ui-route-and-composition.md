%% =========================================================
%% File: ui-route-and-composition.mmd
%% Mermaid Live safe
%% =========================================================
graph TD

  Shell[
  Root shell
  app/layout.tsx
  ]

  Header[
  HeaderControls
  TopNavMenu
  LongCacheIndicator
  RaidRemindersDrawer
  ]

  Routes[
  Page routes
  app routes
  ]

  Home[
  Home route
  app/page.tsx
  ModulePanel tiles to tools
  ]

  ItemDetail[
  Item detail
  /items/:id
  ItemHero
  ItemStatsPanel
  ItemDetailsTabs
  ]

  Browse[
  Item Browser
  /items/browse
  ItemsBrowseClient
  ]

  Recycle[
  Recycle Helper
  /recycle-helper
  RecycleHelperClient
  ]

  RepairCalc[
  Repair Replace
  /repair-calculator
  RepairCalculatorClient
  ]

  RepairBreak[
  Repair and Recycle Breakdown
  /repair-breakdown
  RepairBreakdownClient
  ]

  BrowseParts[
  ItemCard grid
  Preview modal
  useCachedJson to api items
  ]

  RecycleParts[
  ItemPicker
  ModulePanel results
  useCachedJson to api items
  ]

  RepairCalcParts[
  ItemPicker
  CostCard panels
  computeRepairSummary
  ]

  RepairBreakParts[
  CostCard tables
  listRepairableItems
  ]

  Shell --> Header
  Shell --> Routes

  Routes --> Home
  Routes --> ItemDetail
  Routes --> Browse
  Routes --> Recycle
  Routes --> RepairCalc
  Routes --> RepairBreak

  Browse --> BrowseParts
  Recycle --> RecycleParts
  RepairCalc --> RepairCalcParts
  RepairBreak --> RepairBreakParts
