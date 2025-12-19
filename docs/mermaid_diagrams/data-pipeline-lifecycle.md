%% =========================================================
%% File: data-pipeline-lifecycle.mmd
%% Mermaid Live safe
%% =========================================================
flowchart TD

  MF[
  MetaForge external data
  ] --> EF[
  Supabase Edge Function
  writes ingest
  ]

  subgraph DB[Supabase Postgres]
    ING[
    rp_items_ingest
    raw landing zone
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
    durability rules
    ]
    RECIPE[
    rp_repair_recipes
    repair components
    ]
    RepairNote[
    Repair tables are manual
    nullable allowed
    must reference canonical id
    ]

    V_META[
    rp_view_metadata
    app contract view
    ]
    V_CRAFT[
    rp_view_crafting_normalized
    app contract view
    ]
    V_REC[
    rp_view_recycle_outputs
    app contract view
    ]
    V_RP[
    rp_view_repair_profiles
    app contract view
    ]
    V_RR[
    rp_view_repair_recipes
    app contract view
    ]

    VER[
    rp_dataset_version
    version stamp
    ]
  end

  EF --> ING

  ING --> NEED
  PAT --> NEED
  IGN --> NEED

  NEED --> PAT
  NEED --> IGN

  ING --> MERGE
  PAT --> MERGE
  IGN --> MERGE
  MERGE --> CAN

  CAN --> V_META
  CAN --> V_CRAFT
  CAN --> V_REC

  CAN --> PROF
  CAN --> RECIPE
  PROF --> RECIPE

  PROF --> V_RP
  RECIPE --> V_RR

  VER --> V_META

  PROF -.-> RepairNote
  RECIPE -.-> RepairNote

