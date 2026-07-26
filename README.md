# GlassLogic — Frontend

React + TypeScript UI for GlassLogic, an auto-glass shop management app: customer records, discount schedules, NAGS vehicle/part lookup and quoting, invoicing, EDI claims, and scheduling.

This is the frontend half of the project. The API it talks to lives in a separate `glasslogic-server` repo.

## Tech stack

- React 18 + TypeScript
- Vite
- Framer Motion, Lucide icons

## Prerequisites

- Node.js 18+
- The [GlassLogic API server](../server) running locally (default `http://localhost:4000`)

## Setup

```bash
npm install
npm run dev
```

Vite automatically loads `.env.development` in dev mode, which points the app at the local API (`VITE_API_URL`, defaults to `http://localhost:4000/api` — see `src/api/client.ts`). Override it with your own `.env.local` if your API runs elsewhere.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |

## Project structure

```
src/
  api/          API client (all backend calls go through client.ts)
  components/   Page/feature components (CustomerList, Discounts, Invoice, NAGS lookup, etc.)
  test_data/    Local sample data / seed SQL for reference
  App.tsx       Top-level layout, page routing (sidebar-driven, no router lib)
  types.ts      Shared TypeScript types
```

## Related repo

- Backend/API: `glasslogic-server`
