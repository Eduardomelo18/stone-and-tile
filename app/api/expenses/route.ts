import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const sb = createServerClient()
  const { data, error } = await sb.from('company_expenses').select('*').order('category')
  if (error) {
    console.log('GET /api/expenses error:', JSON.stringify(error))
    return Response.json({ error: error.message }, { status: 500 })
  }
  console.log('GET /api/expenses rows:', data?.length)
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const sb = createServerClient()
  const body = await request.json()
  if (body.expense_date === '') body.expense_date = null
  const { data, error } = await sb.from('company_expenses').insert(body).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
