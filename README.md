# Raider Pal

Raider Pal is an unofficial ARC Raiders companion web app focused on fast item lookup and practical “repair vs replace” decisions.

Live site: https://raiderpal.vercel.app/

The project exists to answer questions the game itself doesn’t surface cleanly:  
*What does this item break down into? Where does it come from? Is it worth repairing, or should I just replace it?*

---

## What it does

- **Item Browser**
  - Search, rarity filtering, and pagination over canonical item data
  - Item detail modal with tabs for crafting, recycling, sources, and “used in”
- **Repair Calculator**
  - Computes repair cycles and component totals using curated repair profiles and recipes
  - Breaks costs down per cycle and to full durability
- **Local-only utilities**
  - Raid reminders / notes stored in localStorage
  - Optional long-term client caching toggle
- **Production PWA**
  - Offline fallback and runtime caching in production builds

---

## Tech stack

- **Next.js (App Router)** with React + TypeScript  
- **Tailwind CSS**, using CSS variable–backed design tokens  
- **Supabase (Postgres)** with app-facing read-only views  
- **Vitest** for unit and contract tests  
- **next-pwa** for production service worker support  

---

## Running locally

This project is primarily intended to be evaluated via the **live site**:

[https://raiderpal.vercel.app](https://raiderpal.vercel.app)

Local development **requires a Supabase project** that implements the same app-facing views used in production. This repository includes **contracts and documentation** describing those views, but it does **not** ship with a public database, migrations, or seed data.

If you want to run the app locally anyway:

### Install and start dev mode

```bash
npm install
npm run dev
```

> ⚠️ The app will not function correctly unless the required Supabase views and environment variables are present.

### Test production behavior (including PWA)

```bash
npm run build
npm run start
```

This mirrors production behavior more closely, including service worker registration when PWA is enabled.

---

### Environment variables

The app expects Supabase credentials and a few optional runtime values:

* `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
* `SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY` (server-only; only required for service access)
* `NEXT_PUBLIC_SITE_URL` (metadata base)
* `REVALIDATE_TOKEN` (guards `/api/revalidate`)

### Database expectations

The app reads **only from view contracts** (`rp_view_*`) and never queries raw tables directly. To recreate a compatible database, refer to:

* `docs/contracts.md` — required view names and columns
* `docs/raiderpal-db-architecture.md` — database layering and design intent
* `docs/DATA_LAYER.md` — validation, query boundaries, and repository behavior

---

### Notes

* This repository is **not** intended to be a drop-in, self-contained demo.
* The live deployment is the authoritative reference for behavior and UX.
* Local development is provided for inspection, experimentation, or extension by those willing to recreate the data layer.

---

## Data model (high level)

* External game data is ingested and corrected outside the app, then materialized into a **minimal canonical table**.
* The app reads exclusively from **app-facing database views** (`rp_view_*`) defined as contracts.
* Repository functions query those views, validate rows, and enrich payloads with shared metadata.
* Repair data is **manually curated** because upstream sources do not expose repair mechanics.
* A dataset version (`rp_dataset_version`) is used to version client cache keys and invalidate stale item detail data.

---

## Documentation map

If you want to understand the project beyond this README, start here:

* **docs/ARCHITECTURE.md** — repo layout and responsibility boundaries
* **docs/DATA_FLOWS.md** — end-to-end data flow traces for core features
* **docs/DATA_LAYER.md** — contracts, validation, repositories, and caching
* **docs/contracts.md** — authoritative list of app-facing DB view shapes
* **docs/UI_SYSTEM.md** — UI primitives, layout patterns, and styling tokens
* **docs/ROUTES.md** — page routes and API endpoints
* **docs/BUILD_CI_PWA.md** — build scripts, CI behavior, and PWA notes
* **docs/raiderpal-db-architecture.md** — database design rationale

The README stays intentionally high-level; the docs are the source of truth.

---

## Build, CI, and PWA notes

* CI runs linting, type checks, tests, and a production build on PRs and pushes.
* PWA behavior is enabled only for production builds.
* Generated Workbox artifacts are ignored by git to keep the repo clean.

See **docs/BUILD_CI_PWA.md** for details.

---

## Future work

This README is not a roadmap. Ongoing and future work is tracked in GitHub Issues.

Likely areas of continued iteration:

* Mobile and PWA ergonomics for the Repair Calculator
* Further tightening of UI layout primitives for small screens
* Expanded contract and invariant test coverage
* Continued cleanup and clarification of service worker ownership

---

## Development approach

Raider Pal was built using an AI-assisted development workflow.

I am not a traditional software engineer by background. Instead, this project reflects a systems-first approach: defining clear data contracts, architectural boundaries, and validation layers, then using modern tools to implement and iterate safely.

AI tools (including ChatGPT, Codex, GitHub Copilot, and Claude Code) were used as **implementation accelerators**, not decision-makers. All architectural decisions, data models, validation rules, and integration boundaries were designed, reviewed, and validated manually.

This repo intentionally emphasizes:
- explicit data contracts and invariants
- clear server vs client responsibilities
- readable, explainable control flow
- production-safe failure modes

The goal of this project is not to demonstrate “typing speed,” but to demonstrate how complex systems can be designed, reasoned about, and maintained using modern tooling.

---

## Disclaimer

Raider Pal is an unofficial fan project.
ARC Raiders and related assets are the property of their respective rights holders.