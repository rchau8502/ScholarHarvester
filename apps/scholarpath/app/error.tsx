'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-20">
      <section className="glass-panel rounded-[1.75rem] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Error</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-3 text-sm text-slate-300">Please retry. If this keeps happening, check server configuration.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-slate-950"
        >
          Try again
        </button>
      </section>
    </main>
  )
}
