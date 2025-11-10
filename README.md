# ScholarStack

Mono-repo for ScholarHarvester v2 (data collection), ScholarAPI (FastAPI read-only API), and ZotPlanner (Next.js evidence dashboard) with Docker, CI, and legal guardrails.

## Quickstart (5 minutes)

```sh
make up           # start Postgres + Redis
make seed         # seed demo metrics/data
make dev          # run API + Next.js frontend (watch mode)
```

Visit `http://localhost:8080/healthz` to verify ScholarAPI and `http://localhost:3000/planner` for ZotPlanner.

See each package's README for details:

- `apps/scholarharvester/README.md`
- `apps/scholarapi/README.md`
- `apps/zot-planner/README.md`
