-- =========================================================
-- Raider Pal – Schema Introspection Queries
-- =========================================================
-- Purpose:
--   Canonical reference queries for inspecting the live
--   Supabase Postgres schema (public).
--
-- Usage:
--   • Run these queries when the DB structure changes
--   • Save outputs as markdown in:
--       docs/db/schema-introspection-snapshot.md
--   • Used to generate ER diagrams and view dependency maps
--
-- WARNING:
--   These queries describe the *shape* of the database.
--   Do not modify casually unless schema rules change.
-- =========================================================

-- =========================================================
-- Refresh Checklist (Schema Introspection)
-- =========================================================
-- When to refresh:
--   • After any DDL change (tables/columns/constraints/views)
--   • After renaming columns or changing view contracts
--   • Before generating/updating Mermaid diagrams
--
-- Steps:
--   1) Run each section query top-to-bottom (1 through 6).
--   2) Export results as Markdown tables (preferred) OR JSON.
--   3) Update docs/db/schema-introspection-snapshot.md:
--        - Fill Snapshot metadata (date, project, reason)
--        - Paste outputs into matching sections
--   4) Optional: also save JSON outputs for automation:
--        docs/db/schema-introspection-snapshot.json
--   5) Regenerate diagrams:
--        - docs/diagrams/*.mmd
--   6) Sanity-check:
--        - PKs and FKs match expectations
--        - View list includes all rp_view_* contracts
--        - FK delete rules are reviewed for safety
--
-- Tip:
--   Keep the SQL queries stable; treat the snapshot MD as the
--   versioned artifact that changes when the schema changes.
-- =========================================================

-- =========================================================
-- 1. Base Tables and Columns
-- ---------------------------------------------------------
-- Why:
--   Canonical list of base tables and their columns.
--   Used to understand table structure and generate ERDs.
--
-- Notes:
--   • BASE TABLE only (no views)
--   • Ordered by table, then column position
-- =========================================================
select
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
from information_schema.columns c
join information_schema.tables t
  on t.table_schema = c.table_schema
 and t.table_name = c.table_name
where c.table_schema = 'public'
  and t.table_type = 'BASE TABLE'
order by c.table_name, c.ordinal_position;



-- =========================================================
-- 2. Primary Keys
-- ---------------------------------------------------------
-- Why:
--   Identifies the primary key columns for each base table.
--   Required for relationship and ownership diagrams.
-- =========================================================
select
  tc.table_name,
  kcu.column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
where tc.table_schema = 'public'
  and tc.constraint_type = 'PRIMARY KEY'
order by tc.table_name, kcu.ordinal_position;



-- =========================================================
-- 3. Foreign Key Relationships
-- ---------------------------------------------------------
-- Why:
--   Shows table.column → referenced_table.column relationships.
--   Core input for FK arrows in ER diagrams.
-- =========================================================
select
  tc.table_name as table_name,
  kcu.column_name as column_name,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column,
  tc.constraint_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.table_schema = tc.table_schema
where tc.table_schema = 'public'
  and tc.constraint_type = 'FOREIGN KEY'
order by tc.table_name, tc.constraint_name, kcu.ordinal_position;



-- =========================================================
-- 4. Tables and Views Inventory
-- ---------------------------------------------------------
-- Why:
--   Quick inventory of everything in the public schema.
--   Useful for scoping diagrams and filtering rp_* objects.
-- =========================================================
select
  table_name,
  table_type
from information_schema.tables
where table_schema = 'public'
order by table_type, table_name;



-- =========================================================
-- 5. View Definitions
-- ---------------------------------------------------------
-- Why:
--   Captures the SQL backing each view.
--   Used to build view dependency diagrams and understand
--   which base tables or views each contract relies on.
-- =========================================================
select
  schemaname,
  viewname,
  pg_get_viewdef(
    format('%I.%I', schemaname, viewname)::regclass,
    true
  ) as view_sql
from pg_views
where schemaname = 'public'
order by viewname;



-- =========================================================
-- 6. Foreign Key Update / Delete Rules
-- ---------------------------------------------------------
-- Why:
--   Shows CASCADE / RESTRICT behavior for foreign keys.
--   Critical for understanding destructive operations
--   and safe delete boundaries.
-- =========================================================
select
  tc.table_name,
  tc.constraint_name,
  rc.update_rule,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.referential_constraints rc
  on rc.constraint_name = tc.constraint_name
 and rc.constraint_schema = tc.table_schema
where tc.table_schema = 'public'
  and tc.constraint_type = 'FOREIGN KEY'
order by tc.table_name, tc.constraint_name;
