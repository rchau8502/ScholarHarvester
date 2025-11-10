# ZotPlanner

Next.js 15 + Tailwind UI and Evidence Drawer for planning. Uses the ScholarAPI for metrics, citations, and provenance.

## Getting started

```sh
cd apps/zot-planner
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` (see `.env.local.example` in this repo).

## Tests

- `npm run test` (Vitest unit tests)
- `npm run test:e2e` (Playwright E2E against `http://localhost:3000`)

## Features

- Planner page with campus/cohort/major selectors + KPI cards and evidence drawer.
- Search page for source schools with quick “Add to planner” helper.
- Non-affiliation notice baked into layout.
