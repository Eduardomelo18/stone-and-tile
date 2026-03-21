import { createClient } from '@supabase/supabase-js'

function getUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set. Copy .env.local.example to .env.local and fill in your Supabase credentials.')
  return url
}
function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Copy .env.local.example to .env.local and fill in your Supabase credentials.')
  return key
}

// Lazy browser client (for client components)
let _supabase: ReturnType<typeof createClient> | null = null
export function getSupabase() {
  if (!_supabase) _supabase = createClient(getUrl(), getAnonKey())
  return _supabase
}

// Server client (for API routes - uses service role key to bypass RLS)
export function createServerClient() {
  const url = getUrl()
  const anonKey = getAnonKey()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceRoleKey) {
    return createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return createClient(url, anonKey)
}
