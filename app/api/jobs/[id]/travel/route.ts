import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest, ctx: RouteContext<'/api/jobs/[id]/travel'>) {
  const { id } = await ctx.params
  const sb = createServerClient()
  const body = await request.json()
  const { data, error } = await sb.from('job_travel').insert({ ...body, job_id: id }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/jobs/[id]/travel'>) {
  const { id: jobId } = await ctx.params
  const { searchParams } = new URL(request.url)
  const rowId = searchParams.get('row_id')
  if (!rowId) return Response.json({ error: 'row_id required' }, { status: 400 })
  const sb = createServerClient()
  const body = await request.json()
  const { data, error } = await sb.from('job_travel').update(body).eq('id', rowId).eq('job_id', jobId).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/jobs/[id]/travel'>) {
  const { id: jobId } = await ctx.params
  const { searchParams } = new URL(request.url)
  const rowId = searchParams.get('row_id')
  if (!rowId) return Response.json({ error: 'row_id required' }, { status: 400 })
  const sb = createServerClient()
  const { error } = await sb.from('job_travel').delete().eq('id', rowId).eq('job_id', jobId)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
