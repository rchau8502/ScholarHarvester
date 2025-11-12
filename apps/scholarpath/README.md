# ScholarPath

Next.js 15 + Tailwind UI + API Route Handlers backed by Supabase. Provides the evidence drawer UX for campuses, cohorts, and majors.

## Getting started

```sh
cd apps/scholarpath
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side use only, e.g., local route testing)

## Tests

- `npm run test` (Vitest unit tests)
- `npm run test:e2e` (Playwright E2E against `http://localhost:3000`)

## Features

- Planner page with campus/cohort/major selectors + KPI cards and evidence drawer.
- Search page for source schools with quick “Add to planner” helper.
- Non-affiliation notice baked into layout.
