%% =========================================================
%% File: data-ownership-and-access.mmd
%% Mermaid Live safe
%% Includes canonical merge node so manual patch loop connects
%% Also fixes a key inconsistency: repo must read from views, not the other way around
%% =========================================================
graph LR

  subgraph Client[Client components]
    UI[
    UI event or state change
    select item
    paginate
    toggle mode
    ]
    Cache[
    useCachedJson
    client cache
    response validation
    optional data schema validation
    ]
  end

  subgraph API[Next.js API routes]
    Handler[
    route.ts handler
    calls repo
    returns ApiResponse envelope
    ]
    Envelope[
    ApiResponse contract
    success true data
    success false error
    dev throws
    prod returns error envelope
    ]
  end

  subgraph Server[Server components and repositories]
    Page[
    Server page or component
    SSR or server load
    no HTTP
    ]
    Repo[
    lib data repositories
    contract validation
    metadata enrichment
    ]
    Query[
    queryView helpers
    centralized selects
    invariant enforcement
    ]
    Views[
    Supabase view contracts
    rp_view_metadata
    rp_view_crafting_normalized
    rp_view_recycle_outputs
    rp_view_repair_recipes
    rp_view_repair_profiles
    ]
    Tables[
    Supabase table contracts
    rp_dataset_version
    ]
  end

  UI --> Cache
  Cache --> Handler
  Handler --> Repo
  Repo --> Query
  Query --> Views
  Query --> Tables
  Views --> Query
  Tables --> Query
  Query --> Repo
  Repo --> Handler
  Handler --> Envelope
  Envelope --> Cache
  Cache --> UI

  Page --> Repo
  Repo --> Page
