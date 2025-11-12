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

## Source registry

Edit `SOURCE_REGISTRY.yaml` to add crawlers/export paths. Robots decisions and throttle information are recorded automatically.

## Seeds and data

Run `poetry run scholarharvester.seed_demo` or `make seed` to populate campuses, majors, demo metrics, and citations that power ScholarPath until the first harvest.
