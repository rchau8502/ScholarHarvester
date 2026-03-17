export const metadata = {
  title: 'Privacy | ScholarStack'
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <section className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Policy</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Privacy</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
          <p>
            ScholarStack stores planning state and admissions metrics to provide campus planning features.
            We only process information required to operate the planner, search, and ingest workflows.
          </p>
          <p>
            AI features send request payloads to the configured OpenAI API account. Do not submit sensitive
            personal data in free-text fields.
          </p>
          <p>
            Metrics and citations shown in the app are sourced from official datasets and operator ingests.
            Evidence quality depends on source recency and dataset coverage.
          </p>
        </div>
      </section>
    </main>
  )
}
