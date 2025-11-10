# ScholarPath

ScholarPath is a Next.js 15 application delivering an evidence-driven college planning experience for California learners.

## Key Screens

- **Planner (`/planner`)** — select campus, cohort year, and view KPIs (GPA percentiles and admit rate). Launch the Evidence Drawer to audit sources.
- **Search (`/search`)** — discover source schools and add them to the planner context.

The UI prominently displays the non-affiliation banner: “Not affiliated with UC/CSU/ASSIST. Year/term matters.”

## Getting Started

```bash
pnpm install
NEXT_PUBLIC_API_URL=http://localhost:8080 pnpm dev
```

## Testing

```
pnpm test        # Vitest unit tests
pnpm e2e         # Playwright end-to-end flow
```

Playwright expects the API and demo data to be running (`make dev` in the repo root).
