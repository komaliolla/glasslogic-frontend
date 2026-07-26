# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev        # start Vite dev server (loads .env.development automatically)
npm run build       # tsc type-check, then vite build
npm run preview      # preview the production build
```

There is no lint or test script configured in this repo.

## Architecture

This is the frontend for GlassLogic, an auto-glass shop management app (customers, discounts, NAGS vehicle/glass/hardware lookup, invoicing, EDI claims, scheduling). It is a separate repo from the API server (`../server` locally, `glasslogic-server` remote) — the two communicate only over HTTP.

**No router.** `src/App.tsx` is the entire navigation model: a `useState<ActivePage>` holds the current page id, `Sidebar` emits `onItemClick(itemId)`, and `App` switches on that id to render one of the page components. Breadcrumbs are derived from two static lookup tables (`pageBreadcrumbs`, `modalBreadcrumbs`) keyed by the same page/modal ids — when adding a new page, it must be wired into all three: the `ActivePage` union, `pageBreadcrumbs`, and the switch in the render body.

**All backend access goes through `src/api/client.ts`.** It exports a single `api` object of typed request functions plus every shared response type (`Customer`, `Discount`, `NagsGlassPart`, etc.) — component-local type definitions should not duplicate these. `BASE_URL` comes from `VITE_API_URL` (set in `.env.development`), falling back to `http://localhost:4000/api`.

**`src/api/CustomerList.example.tsx`** is a reference implementation showing the API-backed pattern (fetch in `useEffect`, loading/error state) — it's a template for converting other components from local/mock data to `api.*` calls, not a component that's actually rendered. `src/test_data/` holds local sample data and seed SQL used for reference/offline work, separate from the live API path.

**Components are self-contained pages**, not shared UI primitives — each of `src/components/*.tsx` (CustomerList, Discounts, BusinessTypes, NAGSByVehicle, NAGSByPartNumber, SavedQuotes, Invoice, Schedule, SendEDIClaims, PendingEDIClaims) owns its own state, its own inline `styles` object (`React.CSSProperties` records, no CSS-in-JS library, no Tailwind), and calls `api.*` directly rather than through shared hooks or context.

**Env files**: `.env.development` is committed (no secrets, just points at localhost:4000) and loaded automatically by Vite in dev mode; `.env` / `.env.local` are gitignored for local overrides.
