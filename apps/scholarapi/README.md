# ScholarAPI

ScholarAPI is a FastAPI service that exposes Scholarstack data in a read-only manner.

## Features

- Pagination, filtering, and search across campuses, majors, metrics, and provenance.
- Rate limiting via `slowapi` with a default cap of 240 requests/minute (configurable via `RATE_LIMIT_PER_MINUTE`).
- CORS defaults to `http://localhost:3000` for the ScholarPath frontend.
- Automated tests using `pytest` and `httpx.AsyncClient`.

## Running Locally

```bash
poetry install
DATABASE_URL=postgresql+psycopg://scholar:scholar@localhost:5432/scholarstack \
  poetry run uvicorn scholarapi.main:app --reload --port 8080
```

## Endpoints

- `GET /health` — readiness probe.
- `GET /v1/campuses` — list campuses with pagination.
- `GET /v1/metrics` — filter by campus, metric key, year.
- `GET /v1/profile/{campus_slug}` — campus profile with GPA and admit KPIs.
- `GET /v1/provenance` — citation catalogue for metrics.

See `src/scholarapi/api` for route implementations.
