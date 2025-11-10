# ScholarHarvester v2

Python 3.11 / Poetry harvester for UC/CSU/CCCCO data. Adapters live in `src/scholarharvester/adapters`.

## Legal guardrails

- No ASSIST.org scraping; rely only on official endpoints and admin exports.
- Honor robots.txt decisions; throttle ≥2s per domain and log the decision in `SOURCE_REGISTRY.robots.json`.
- Every metric stores a citation (title, publisher, year, url, interpretation). Banner: “Not affiliated with UC/CSU/ASSIST. Year/term matters.”

## CLI

```sh
poetry run scholarharvester harvest list
poetry run scholarharvester harvest run uc_info_center_transfers_major --since 2024 --campus "UC Irvine"
poetry run scholarharvester harvest provenance --year 2024 --campus "UC Irvine"
poetry run scholarharvester harvest replay <dataset_id>
```

## Source registry

Edit `SOURCE_REGISTRY.yaml` to add crawlers/export paths. Robots decisions and throttle information are recorded automatically.

## Seeds and data

Run `poetry run scholarharvester.seed_demo` or `make seed` to populate campuses, majors, demo metrics, and citations that power ZotPlanner until the first harvest.
