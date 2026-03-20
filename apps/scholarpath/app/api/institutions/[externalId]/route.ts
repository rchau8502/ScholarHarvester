import { NextRequest, NextResponse } from 'next/server'
import { getInstitutionFromSupabase } from '@/lib/server/institutions'

export async function GET(_: NextRequest, context: { params: Promise<{ externalId: string }> }) {
  const { externalId } = await context.params
  const institution = await getInstitutionFromSupabase(externalId)
  return NextResponse.json({ institution })
}
