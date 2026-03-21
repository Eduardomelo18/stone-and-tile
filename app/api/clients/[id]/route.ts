import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/clients/[id]'>) {
  const { id } = await ctx.params
  const sb = createServerClient()
  const { data, error } = await sb.from('clients').select('*').eq('id', id).single()
  if (error) return Response.json({ error: error.message }, { status: 404 })
  return Response.json(data)
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/clients/[id]'>) {
  const { id } = await ctx.params
  const sb = createServerClient()
  const body = await request.json()
  const { data, error } = await sb.from('clients').update(body).eq('id', id).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/clients/[id]'>) {
  const { id } = await ctx.params
  const sb = createServerClient()
  const { error } = await sb.from('clients').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
