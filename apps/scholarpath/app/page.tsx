import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-primary">ScholarPath</h1>
      <p className="text-lg">Plan evidence-backed journeys through UC, CSU, and CCC transfer pathways.</p>
      <div className="flex gap-4">
        <Link className="rounded bg-primary px-4 py-2 text-white" href="/planner">
          Go to Planner
        </Link>
        <Link className="rounded border border-primary px-4 py-2 text-primary" href="/search">
          Search Source Schools
        </Link>
      </div>
    </div>
  )
}
