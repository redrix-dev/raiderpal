# Raider Pal

A lightweight, fan-made item lookup tool for **ARC Raiders**.  
Built to make it easier to check crafting inputs, recycling outputs, and item relationships without flipping through in-game menus or wiki pages.

Live site: https://raiderpal.vercel.app

---

## Features

- Browse all known ARC Raiders items  
- View crafting components  
- View recycling outputs  
- See "used in" relationships  
- Clean responsive UI for mobile and desktop  
- Fast, low-overhead deployment via Vercel

---

## How It Works

Raider Pal pulls public ARC Raiders data (via MetaForge), normalizes it through a Supabase Edge Function, and stores structured tables in Supabase Postgres.  
The UI is built in Next.js and deployed automatically through Vercel.

**Data flow:**

`MetaForge CDN → Supabase Edge Function → Supabase DB → Next.js (Vercel)`

No authentication, tracking, or client-side data collection.

---

## Tech Stack

- **Next.js (App Router)** – frontend + API routes  
- **React** – UI components  
- **Tailwind CSS** – styling  
- **Supabase** – Postgres, Edge Functions  
- **Vercel** – hosting, CI/CD, preview deployments  
- **TypeScript** – type safety  

---

## Running Locally

```bash
git clone https://github.com/redrix-dev/raider-pal.git
cd raider-pal
npm install
npm run dev