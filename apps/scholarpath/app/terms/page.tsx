export const metadata = {
  title: 'Terms | ScholarStack'
}

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <section className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Policy</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Terms</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
          <p>
            ScholarStack provides informational planning tools only. It does not guarantee admission outcomes
            and does not replace official campus guidance.
          </p>
          <p>
            You are responsible for verifying all deadlines, coursework requirements, and transfer articulation
            details with official university and college resources.
          </p>
          <p>
            Abuse of automated endpoints, scraping, or unauthorized access attempts may be blocked.
          </p>
        </div>
      </section>
    </main>
  )
}
