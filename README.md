# ScholarStack

Mono-repo for:

- **ScholarHarvester** – Python adapters + legal guardrails that write metrics/citations into Supabase.
- **ScholarStack app** – Next.js 15 UI + API Route Handlers deployed to Vercel.
- **Supabase** – managed Postgres/Storage (see `supabase/schema.sql`) powering the API + UI.

## Quickstart (5 minutes)

```sh
make up           # optional: local Postgres + Redis for adapter dev
SUPABASE_DB_DSN="postgres://..." make seed
make dev          # run the ScholarStack app locally (http://localhost:3000/planner)
```

See each package's README for deeper setup:

- `apps/scholarharvester/README.md`
- `apps/scholarpath/README.md`
