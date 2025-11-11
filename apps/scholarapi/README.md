# ScholarAPI

FastAPI read-only layer over ScholarHarvester datasets.

## Quickstart

```sh
cd apps/scholarapi
poetry install
poetry run uvicorn scholarapi.main:app --reload
```

Environment variables:

- `DATABASE_URL` (Postgres in Docker or a local dev DB)
- `CORS_ORIGINS` (comma-separated list for ScholarPlanner)
- `RATE_LIMIT` (default `60/minute`)

Rate limiting uses SlowAPI with friendly fallback to 429. CORS only allows GET.

## Endpoints

- `GET /healthz`
- `GET /v1/campuses`
- `GET /v1/majors`
- `GET /v1/source-schools`
- `GET /v1/datasets`
- `GET /v1/metrics` (cursor pagination via `cursor` and filters)
- `GET /v1/provenance`
- `GET /v1/profile/transfer`
- `GET /v1/profile/freshman`

All responses guarantee citations with interpreter notes.

## Tests

```sh
poetry run pytest
```
