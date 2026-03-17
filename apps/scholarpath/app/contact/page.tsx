export const metadata = {
  title: 'Contact | ScholarStack'
}

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <section className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Support</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Contact</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
          <p>
            For dataset corrections, source citation issues, or partnership questions, contact the ScholarStack
            operations team.
          </p>
          <p>
            Email: <a className="text-amber-200 underline" href="mailto:support@scholarstack.app">support@scholarstack.app</a>
          </p>
          <p>When reporting a data issue, include campus, cohort, year, and a source URL so we can verify quickly.</p>
        </div>
      </section>
    </main>
  )
}
