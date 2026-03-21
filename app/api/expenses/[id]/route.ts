import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/expenses/[id]'>) {
  const { id } = await ctx.params
  const sb = createServerClient()
  const body = await request.json()
  if (body.expense_date === '') body.expense_date = null
  const { data, error } = await sb.from('company_expenses').update(body).eq('id', id).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/expenses/[id]'>) {
  const { id } = await ctx.params
  const sb = createServerClient()
  const { error } = await sb.from('company_expenses').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
