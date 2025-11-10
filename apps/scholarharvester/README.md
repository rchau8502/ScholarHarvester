# ScholarHarvester v2

ScholarHarvester is a lawful collection framework that hydrates the Scholarstack database with UC, CSU, CCCCO, and IPEDS data—while explicitly avoiding ASSIST.org scraping.

## Key Principles

- **Legal guardrails:** every adapter validates the requested URL against our blocklist, respects `robots.txt`, and enforces a minimum 2s delay per domain.
- **Provenance first:** each metric written to the database is paired with a citation (title, publisher, year, url, interpretation_note). The provenance ledger is surfaced through `DATA_PROVENANCE.md`.
- **Queue aware:** long-running harvest jobs can be enqueued to Redis-backed Celery workers or executed synchronously for development.

## Getting Started

```bash
poetry install
poetry run alembic upgrade head
poetry run scholarharvester seed demo
poetry run scholarharvester harvest uc
```

## CLI Overview

```
scholarharvester harvest [adapter]
scholarharvester seed demo
scholarharvester robots review [url]
scholarharvester provenance export
```

See `scholarharvester/cli.py` for the full command catalogue.

## Tests

```
poetry run pytest
```

VCR cassettes are committed to document approved network calls to public endpoints.

## Legal Notes

See [`LEGAL_NOTES.md`](LEGAL_NOTES.md) for statutory constraints and [`DATA_PROVENANCE.md`](DATA_PROVENANCE.md) for the auto-generated provenance register.
