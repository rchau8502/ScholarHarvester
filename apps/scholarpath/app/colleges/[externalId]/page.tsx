import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getInstitutionFromSupabase } from '@/lib/server/institutions'

function formatInteger(value?: number | null) {
  return value == null ? 'N/A' : new Intl.NumberFormat('en-US').format(value)
}

function formatPercent(value?: number | null) {
  return value == null ? 'N/A' : `${Math.round(value * 100)}%`
}

function formatCurrency(value?: number | null) {
  return value == null ? 'N/A' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export default async function CollegeProfilePage({ params }: { params: Promise<{ externalId: string }> }) {
  const { externalId } = await params
  const institution = await getInstitutionFromSupabase(externalId)

  if (!institution) {
    notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">College profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{institution.name}</h1>
        <p className="mt-2 text-sm text-slate-300">
          {institution.city}, {institution.state} • {institution.control ?? 'Unknown control'}
          {institution.locale ? ` • ${institution.locale}` : ''}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/colleges" className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200">
            Back to explorer
          </Link>
          {institution.website && (
            <a
              href={institution.website}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Visit official site
            </a>
          )}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass-panel rounded-3xl p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Students</div>
          <div className="mt-3 text-2xl font-semibold text-white">{formatInteger(institution.student_size)}</div>
        </div>
        <div className="glass-panel rounded-3xl p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Admission rate</div>
          <div className="mt-3 text-2xl font-semibold text-white">{formatPercent(institution.admission_rate)}</div>
        </div>
        <div className="glass-panel rounded-3xl p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Average net price</div>
          <div className="mt-3 text-2xl font-semibold text-white">{formatCurrency(institution.avg_net_price)}</div>
        </div>
        <div className="glass-panel rounded-3xl p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Completion rate</div>
          <div className="mt-3 text-2xl font-semibold text-white">{formatPercent(institution.completion_rate)}</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="glass-panel rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Admissions and scale</p>
          <dl className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex justify-between gap-4">
              <dt>SAT average</dt>
              <dd className="text-white">{formatInteger(institution.sat_average)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>ACT midpoint</dt>
              <dd className="text-white">{institution.act_midpoint ?? 'N/A'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Retention rate</dt>
              <dd className="text-white">{formatPercent(institution.retention_rate)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Highest degree</dt>
              <dd className="text-white">{institution.highest_degree ?? 'N/A'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Carnegie basic</dt>
              <dd className="text-right text-white">{institution.carnegie_basic ?? 'N/A'}</dd>
            </div>
          </dl>
        </article>

        <article className="glass-panel rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Costs and outcomes</p>
          <dl className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex justify-between gap-4">
              <dt>In-state tuition</dt>
              <dd className="text-white">{formatCurrency(institution.tuition_in_state)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Out-of-state tuition</dt>
              <dd className="text-white">{formatCurrency(institution.tuition_out_of_state)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Federal aid rate</dt>
              <dd className="text-white">{formatPercent(institution.federal_aid_rate)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Median earnings (10y)</dt>
              <dd className="text-white">{formatCurrency(institution.median_earnings_10yr)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Price calculator</dt>
              <dd className="text-right text-white">
                {institution.price_calculator_url ? (
                  <a href={institution.price_calculator_url} target="_blank" rel="noreferrer" className="text-amber-200 underline-offset-4 hover:underline">
                    Open
                  </a>
                ) : (
                  'N/A'
                )}
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  )
}
