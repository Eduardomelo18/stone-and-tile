import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/jobs/[id]'>) {
  const { id } = await ctx.params
  const sb = createServerClient()
  const { data, error } = await sb
    .from('jobs')
    .select('*, client:clients(*)')
    .eq('id', id)
    .single()
  if (error) return Response.json({ error: error.message }, { status: 404 })
  return Response.json(data)
}

function sanitiseJob(body: Record<string, unknown>) {
  const n = (v: unknown) => (v === '' ? null : v)
  body.start_time = n(body.start_time)
  body.end_time = n(body.end_time)
  body.client_id = n(body.client_id)
  body.suburb = n(body.suburb)
  body.address = n(body.address)
  body.service_type = n(body.service_type)
  body.description = n(body.description)
  body.notes = n(body.notes)
  return body
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/jobs/[id]'>) {
  const { id } = await ctx.params
  const sb = createServerClient()
  const body = sanitiseJob(await request.json())
  const { data, error } = await sb
    .from('jobs')
    .update(body)
    .eq('id', id)
    .select('*, client:clients(*)')
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/jobs/[id]'>) {
  const { id } = await ctx.params
  const sb = createServerClient()
  const { error } = await sb.from('jobs').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
