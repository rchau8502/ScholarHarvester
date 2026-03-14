# ScholarPath

Next.js 15 + Tailwind UI + API Route Handlers for the ScholarStack website. The app now works without Supabase by default: it can serve bundled JSON data on Vercel, or read from a remote JSON endpoint if you want editable storage outside the repo.

## Getting started

```sh
cd apps/scholarpath
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and set:

- `OPENAI_API_KEY` to enable `/ingest` and planner AI guidance
- `OPENAI_MODEL` optional override, default `gpt-5`
- `SCHOLARPATH_DATA_URL` optional remote JSON source for metrics/datasets/source schools
- `SCHOLARPATH_INGEST_WEBHOOK_URL` optional webhook for persistence after AI extraction

## Storage model

- Default: bundled local data shipped with the app. Good for a demo or curated read-only site on Vercel.
- Remote JSON: point `SCHOLARPATH_DATA_URL` at a JSON endpoint if you want updates without redeploying.
- Google Sheets: Vercel does not provide durable local writes, so if you want operator-driven updates you still need an external store. A practical MVP is a Google Apps Script webhook that appends extracted rows to a Google Sheet, then publishes a JSON feed back to `SCHOLARPATH_DATA_URL`.

## Tests

- `npm run test` (Vitest unit tests)
- `npm run test:e2e` (Playwright E2E against `http://localhost:3000`)

## Features

- Planner page with campus/cohort/major selectors + KPI cards and evidence drawer.
- Search page for source schools with quick “Add to planner” helper.
- AI Ingest page for turning raw source text into structured metrics through the OpenAI Responses API.
- Non-affiliation notice baked into layout.
