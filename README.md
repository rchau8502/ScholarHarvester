# Scholarstack

Scholarstack is a mono-repo that powers legal, transparent California college planning. It contains three core applications:

- **ScholarHarvester v2** (`apps/scholarharvester/`): lawful data collectors that hydrate the shared Postgres schema while enforcing strict provenance and robots controls.
- **ScholarAPI** (`apps/scholarapi/`): a FastAPI-based read-only service that exposes planning data to clients with pagination, rate limiting, and CORS.
- **ScholarPath** (`apps/scholarpath/`): a Next.js 15 application that renders the Planner and Evidence Drawer experience for counselors and families.

All services are dockerized and wired together through `docker-compose`. Redis orchestrates the harvester queue, Postgres stores canonical datasets, and the API/Web apps consume the same schema.

## Quickstart

```bash
# start the full stack in development mode
make dev

# seed the database with demo content (run after migrations)
make seed

# run unit and integration tests across apps
make test

# start the stack in detached (production-like) mode
make up

# stop the detached stack and remove containers
make down
```

Refer to [`docs/OPERATIONS.md`](docs/OPERATIONS.md) for a deeper runbook covering log inspection and environment-specific notes.

Each application ships with its own README that details architecture, configuration, and contributing notes:

- [ScholarHarvester README](apps/scholarharvester/README.md)
- [ScholarAPI README](apps/scholarapi/README.md)
- [ScholarPath README](apps/scholarpath/README.md)

## Legal Guardrails

Scholarstack **never** scrapes ASSIST.org and only fetches data from official UC, CSU, CCCCO, and IPEDS sources that permit automated access. The harvester respects `robots.txt`, throttles requests to at least 2 seconds per domain, and records the compliance decision for every run in the database. Provenance for every metric includes title, publisher, year, URL, and interpretation notes, and is surfaced throughout the API and UI.

See [`apps/scholarharvester/LEGAL_NOTES.md`](apps/scholarharvester/LEGAL_NOTES.md) and [`apps/scholarharvester/DATA_PROVENANCE.md`](apps/scholarharvester/DATA_PROVENANCE.md) for more detail.

## Repository Layout

```
.
├── apps/
│   ├── scholarharvester/
│   ├── scholarapi/
│   └── scholarpath/
├── .devcontainer/
├── .github/workflows/
├── docker-compose.yml
├── Makefile
└── README.md
```

## Contributing

1. Install prerequisites described in each app README.
2. Run `make dev` and visit `http://localhost:3000/planner` once the stack is up.
3. Submit pull requests with passing CI (see `.github/workflows/ci.yml`).

MIT licensed. See [LICENSE](LICENSE).
