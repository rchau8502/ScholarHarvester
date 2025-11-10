import { Suspense } from 'react'
import { PlannerView } from '../../components/PlannerView'

export const dynamic = 'force-dynamic'

export default function PlannerPage() {
  return (
    <Suspense fallback={<div>Loading planner...</div>}>
      <PlannerView />
    </Suspense>
  )
}
