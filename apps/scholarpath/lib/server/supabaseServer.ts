import { createClient } from '@supabase/supabase-js'

function requireSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for live data access')
  }
  return url
}

function createSupabaseClient(key: string) {
  return createClient(requireSupabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export function getSupabaseReadClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required for live reads')
  }
  return createSupabaseClient(key)
}

export function getSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for write operations')
  }
  return createSupabaseClient(key)
}
