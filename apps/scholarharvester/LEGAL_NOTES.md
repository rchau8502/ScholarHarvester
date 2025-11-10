# Legal Guardrails for ScholarHarvester

- ScholarHarvester **must never** scrape ASSIST.org. If articulation documents are required, they must be sourced from official administrative uploads provided directly by UC, CSU, or CCCCO stakeholders.
- Only ingest data from official public endpoints that explicitly allow automated access in their terms and `robots.txt` files. All decisions (allow/deny) are recorded via the `robots_decision` table and surfaced in run logs.
- Enforce a minimum delay of 2 seconds between requests per domain. The throttle budget is configured in `scholarharvester/legal.py` and enforced for every adapter call.
- Respect copyright and licensing terms disclosed by UC, CSU, CCCCO, and IPEDS. Store the license metadata in the `source` and `dataset` tables.
- Every metric persisted to the database must reference a citation record containing: `title`, `publisher`, `publication_year`, `url`, and an `interpretation_note` describing how the value should be used.
- Display a non-affiliation notice in every UI entry point: “Not affiliated with UC/CSU/ASSIST. Year/term matters.”
- Provenance must be transparent and reproducible. The CLI command `scholarharvester provenance export` regenerates `DATA_PROVENANCE.md` and should be run after any harvest.
