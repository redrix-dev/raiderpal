%% =========================================================
%% File: end-to-end-data-flow.mmd
%% Mermaid Live safe
%% Includes canonical merge node so manual patch loop connects
%% Also fixes a key inconsistency: repo must read from views, not the other way around
%% =========================================================
flowchart LR

  MF[
  MetaForge external data
  ] --> EF[
  Supabase Edge Function
  batch upsert ingest
  ]

  subgraph DB[Supabase Postgres]
    ING[
    rp_items_ingest
    raw payloads
    ]
    PAT[
    rp_items_patches
    manual patch JSON
    ]
    IGN[
    rp_patch_ignore
    ignore flags
    ]
    NEED[
    rp_items_needing_any_patch view
    triage worklist
    ]

    MERGE[
    canonical refresh process
    applies patches and ignores
    writes canonical
    ]

    CAN[
    rp_items_canonical
    stable payload store
    ]

    PROF[
    rp_repair_profiles
    repair profile rules
    ]
    RECIPE[
    rp_repair_recipes
    repair components
    ]

    V_META[
    rp_view_metadata
    contract view
    ]
    V_CRAFT[
    rp_view_crafting_normalized
    contract view
    ]
    V_REC[
    rp_view_recycle_outputs
    contract view
    ]
    V_RP[
    rp_view_repair_profiles
    contract view
    ]
    V_RR[
    rp_view_repair_recipes
    contract view
    ]

    VER[
    rp_dataset_version
    version stamp
    ]
  end

  %% Ingest write
  EF --> ING

  %% Patch workflow and triage
  ING --> NEED
  PAT --> NEED
  IGN --> NEED
  NEED --> PAT
  NEED --> IGN

  %% Canonicalization should incorporate ingest plus patches plus ignores
  ING --> MERGE
  PAT --> MERGE
  IGN --> MERGE
  MERGE --> CAN

  %% Repair tables depend on canonical ids
  CAN --> PROF
  CAN --> RECIPE
  PROF --> RECIPE

  %% Contract views depend on canonical or repair tables
  CAN --> V_META
  CAN --> V_CRAFT
  CAN --> V_REC
  PROF --> V_RP
  RECIPE --> V_RR
  VER --> V_META

  subgraph APP[Next.js server layer]
    REPO[
    lib data repositories
    define named queries
    attach metadata maps
    ]
    QUERY[
    queryView helpers
    run select
    enforce contracts
    ]
    APIH[
    api route handlers
    return ApiResponse envelope
    ]
  end

  %% App reads from contract views
  V_META --> QUERY
  V_CRAFT --> QUERY
  V_REC --> QUERY
  V_RP --> QUERY
  V_RR --> QUERY

  %% Repo orchestrates queries and is used by API and server pages
  REPO --> QUERY
  REPO --> APIH

  subgraph CLIENT[Client]
    CACHE[
    useCachedJson
    client cache
    parses ApiResponse
    ]
    UI[
    UI components
    user interaction
    ]
  end

  UI --> CACHE
  CACHE --> APIH
  APIH --> CACHE
  CACHE --> UI

  subgraph SC[Server components]
    PAGE[
    app pages
    server load
    no HTTP
    ]
  end

  PAGE --> REPO
  REPO --> PAGE
