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

  ItemBrowser[
  Item Browser
  /item-browser
  ItemBrowserClient
  ]

  RepairCalc[
  Repair Replace
  /repair-calculator
  RepairCalculatorClient
  ]

  ItemBrowserParts[
  Search + filters
  PaginationControls
  Item cards with rarity
  ItemDetailsModal
  useCachedJson to api items
  ]

  RepairCalcParts[
  ItemPicker
  CostCard panels
  computeRepairSummary
  ]

  Shell --> Header
  Shell --> Routes

  Routes --> Home
  Routes --> ItemBrowser
  Routes --> RepairCalc

  ItemBrowser --> ItemBrowserParts
  RepairCalc --> RepairCalcParts
