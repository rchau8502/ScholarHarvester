import Link from 'next/link'

const platformPillars = [
  {
    title: 'ScholarHarvester',
    body:
      'Python adapters collect UC, CSU, and CCCCO data from official sources only, apply throttle and robots guardrails, and preserve citations for every metric.'
  },
  {
    title: 'ScholarStack App',
    body:
      'The Next.js application turns harvested data into a planner, source-school search, and AI-assisted ingest flow for operators and students.'
  },
  {
    title: 'Evidence Layer',
    body:
      'Supabase-ready storage and provenance records keep admissions signals tied to publisher, year, term, and interpretation instead of opaque numbers.'
  }
]

const workflowSteps = [
  'Collect official exports, APIs, and public datasets with legal guardrails.',
  'Normalize metrics, attach citations, and write provenance for every update.',
  'Surface the data in planning tools that make tradeoffs and source evidence visible.'
]

const productRoutes = [
  {
    href: '/planner',
    title: 'Planner',
    detail: 'Compare campuses, majors, and cohorts with evidence-backed metrics.'
  },
  {
    href: '/search',
    title: 'Source Schools',
    detail: 'Find source institutions and feed them into the planning flow.'
  },
  {
    href: '/ingest',
    title: 'AI Ingest',
    detail: 'Turn raw admissions text into structured metrics through the Responses API.'
  }
]

const proofPoints = [
  'Official-source only adapters',
  'Citation and provenance on every metric',
  'Transfer and freshman planning flows',
  'Vercel-friendly Next.js app with bundled demo data'
]

export default function Home() {
  return (
    <main>
      <section className="section-glow">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-20 pt-16 md:grid-cols-[1.15fr_0.85fr] md:pt-24">
          <div className="fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-300">
              ScholarStack monorepo
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl">
              Evidence-backed college planning from data harvest to student-facing product.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--page-muted)]">
              This repository combines ScholarHarvester, a guarded data pipeline for California admissions signals,
              with ScholarStack, a Next.js interface that exposes those signals through planning, search, and ingest
              workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/planner"
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px]"
              >
                Open Planner
              </Link>
              <Link
                href="/search"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse Source Schools
              </Link>
              <Link
                href="/ingest"
                className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
              >
                Try AI Ingest
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {proofPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up [animation-delay:120ms]">
            <div className="glass-panel float-card relative rounded-[2rem] p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Platform Overview</div>
                  <div className="mt-2 text-2xl font-semibold text-white">ScholarStack</div>
                </div>
                <div className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                  CA pathways
                </div>
              </div>
              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl border border-white/10 bg-[var(--panel-strong)] p-5">
                  <div className="text-sm text-slate-400">Pipeline</div>
                  <div className="mt-2 text-3xl font-semibold text-white">Harvest -&gt; Cite -&gt; Plan</div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    The repo is built to move from official-source extraction to explainable planning outputs without
                    dropping year, term, or provenance context.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="text-sm text-slate-400">Core stack</div>
                    <div className="mt-2 text-xl font-semibold text-white">Python + Next.js 15</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="text-sm text-slate-400">Storage model</div>
                    <div className="mt-2 text-xl font-semibold text-white">Bundled JSON or remote feed</div>
                  </div>
                </div>
                <div className="rounded-3xl border border-sky-400/20 bg-[var(--cyan-soft)] p-5">
                  <div className="text-sm text-slate-300">Why this matters</div>
                  <p className="mt-2 text-sm leading-7 text-slate-100">
                    Admissions dashboards are only useful if the underlying numbers can be traced back to a specific
                    source and interpretation. This stack keeps that evidence attached.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {platformPillars.map((pillar) => (
            <article key={pillar.title} className="glass-panel rounded-[1.75rem] p-6">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Component</div>
              <h2 className="mt-3 text-2xl font-semibold text-white">{pillar.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-20 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-400">What this repo does</div>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white">
            It is a full data-to-product workflow, not just a static admissions dashboard.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
            ScholarStack starts with harvesting and compliance rules, then moves through normalization and provenance,
            and ends in interfaces that help students or operators make decisions with context.
          </p>
        </div>
        <div className="grid gap-4">
          {workflowSteps.map((step, index) => (
            <div key={step} className="glass-panel rounded-[1.75rem] p-6">
              <div className="text-sm text-slate-400">Step 0{index + 1}</div>
              <p className="mt-2 text-lg leading-8 text-white">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24">
        <div className="glass-panel rounded-[2rem] p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Explore the app</div>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">Start with the interface that matches your job.</h2>
            </div>
            <div className="max-w-xl text-sm leading-7 text-slate-300">
              Each route below is already implemented in the app. The landing page now explains the stack first, then
              routes visitors into the tool they actually need.
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {productRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 transition hover:border-white/25 hover:bg-white/[0.08]"
              >
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Route</div>
                <div className="mt-3 text-2xl font-semibold text-white">{route.title}</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{route.detail}</p>
                <div className="mt-6 text-sm font-semibold text-amber-200">Open {route.title} -&gt;</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
