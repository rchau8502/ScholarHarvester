# ScholarHarvester v2

Python 3.11 / Poetry harvester for UC/CSU/CCCCO data. Adapters live in `src/scholarharvester/adapters`.

## Legal guardrails

- No ASSIST.org scraping; rely only on official endpoints and admin exports.
- Honor robots.txt decisions; throttle ≥2s per domain and log the decision in `SOURCE_REGISTRY.robots.json`.
- Every metric stores a citation (title, publisher, year, url, interpretation). Banner: “Not affiliated with UC/CSU/ASSIST. Year/term matters.”

## Supabase runner

Set `SUPABASE_DB_DSN` (Project Settings → Database → Connection string) and execute:

```sh
cd apps/scholarharvester
poetry install
poetry run python harvest.py --since 2022
```

Use `--adapter <name>` to run a single adapter or `--campus "<campus>"` to scope inputs. The script enforces the registry guardrails, writes metrics and citations through `supa_writer.py`, and appends to `DATA_PROVENANCE.md`.

For deterministic official pulls, set these environment variables to official CSV/JSON export URLs:

- `SCHOLARSTACK_UC_TRANSFERS_CSV_URL`
- `SCHOLARSTACK_UC_FRESHMAN_CSV_URL`
- `SCHOLARSTACK_UC_SOURCE_SCHOOL_CSV_URL`
- `SCHOLARSTACK_CSU_TRANSFER_CSV_URL`
- `SCHOLARSTACK_CSU_FRESHMAN_CSV_URL`
- `SCHOLARSTACK_CCCCO_TRANSFER_CSV_URL`
- `SCHOLARSTACK_CCC_CATALOG_CSV_URL`
- `SCHOLARSTACK_CCC_ARTICULATION_CSV_URL`

If a URL is not set, adapters try to discover an export link from the official base domain, but explicit URLs are recommended for production stability.

Before your first official harvest, clear old synthetic rows:

```sh
psql "$SUPABASE_DB_DSN" -f ../../supabase/cleanup_demo.sql
```

## Source registry

Edit `SOURCE_REGISTRY.yaml` to add crawlers/export paths. Robots decisions and throttle information are recorded automatically.

## Seeds and data

`poetry run scholarharvester.seed_demo` / `make seed` is for local development only.
For production planning, run only official-source harvest adapters and do not seed demo metrics.
