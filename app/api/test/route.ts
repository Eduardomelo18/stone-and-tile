import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const sb = createServerClient()
    const { data, error } = await sb.from('company_expenses').select('count')
    return Response.json({
      success: !error,
      error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null,
      data,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
  } catch (e: any) {
    return Response.json({ crashed: true, message: e.message })
  }
}
