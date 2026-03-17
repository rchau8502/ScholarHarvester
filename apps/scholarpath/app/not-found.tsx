import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-20">
      <section className="glass-panel rounded-[1.75rem] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Page not found</h1>
        <p className="mt-3 text-sm text-slate-300">The route you requested is not available in ScholarStack.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-slate-950"
        >
          Return Home
        </Link>
      </section>
    </main>
  )
}
