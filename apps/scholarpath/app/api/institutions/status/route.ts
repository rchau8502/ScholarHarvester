import { NextResponse } from 'next/server'
import { getInstitutionDirectoryStatus } from '@/lib/server/institutions'

export async function GET() {
  const status = await getInstitutionDirectoryStatus()
  return NextResponse.json(status)
}
