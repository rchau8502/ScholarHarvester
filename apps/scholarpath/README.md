# ScholarStack App

Next.js 15 + Tailwind UI + API Route Handlers for the ScholarStack website.
The application is configured for live data and persistence through Supabase.

## Getting started

```sh
cd apps/scholarpath
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and set:

- `NEXT_PUBLIC_SITE_URL` base URL used by metadata/sitemap (for local: `http://localhost:3000`)
- `NEXT_PUBLIC_SUPABASE_URL` your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` anon key (read-only fallback)
- `SUPABASE_SERVICE_ROLE_KEY` required for ingest writes and cloud plan persistence
- `OPENAI_API_KEY` to enable `/ingest` and planner AI guidance
- `OPENAI_MODEL` optional override, default `gpt-5`
- `SCHOLARSTACK_ADMIN_TOKEN` required by `/api/ingest` (send as `Authorization: Bearer <token>`)
- `SCHOLARSTACK_DATA_URL` optional remote JSON source override (if you do not want direct Supabase reads)

Legacy compatibility: `SCHOLARPATH_DATA_URL` is still accepted.

## Storage model

- Default: live Supabase reads from `dataset`, `metric`, `citation`, `source_school`, and `institution`.
- Ingest writes: `/api/ingest` upserts extracted datasets/metrics/citations into Supabase.
- Planner cloud sync: `/api/plans` stores tasks/schedule snapshots in Supabase `user_plan`.
- National directory: `/api/institutions` and `/colleges` read the `institution` table populated from the official College Scorecard API.
- Optional: point `SCHOLARSTACK_DATA_URL` at a remote JSON feed to override Supabase reads.

## Tests

- `npm run test` (Vitest unit tests)
- `npm run test:e2e` (Playwright E2E against `http://localhost:3000`)

## Features

- Planner page with campus/cohort/major selectors + KPI cards and evidence drawer.
- Search page for source schools with quick “Add to planner” helper.
- Colleges page for national institution search and profile views.
- AI Ingest page for turning raw source text into structured metrics through the OpenAI Responses API.
- Non-affiliation notice baked into layout.
