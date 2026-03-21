import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const sb = createServerClient()
  const { searchParams } = new URL(request.url)

  let query = sb
    .from('jobs')
    .select('*, client:clients(id,name,phone,suburb)')
    .order('date', { ascending: false })

  const status = searchParams.get('status')
  const paymentStatus = searchParams.get('payment_status')
  const suburb = searchParams.get('suburb')
  const clientId = searchParams.get('client_id')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (status) query = query.eq('status', status)
  if (paymentStatus) query = query.eq('payment_status', paymentStatus)
  if (suburb) query = query.ilike('suburb', `%${suburb}%`)
  if (clientId) query = query.eq('client_id', clientId)
  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

function sanitiseJob(body: Record<string, unknown>) {
  const nullIfEmpty = (v: unknown) => (v === '' ? null : v)
  body.start_time = nullIfEmpty(body.start_time)
  body.end_time = nullIfEmpty(body.end_time)
  body.client_id = nullIfEmpty(body.client_id)
  body.suburb = nullIfEmpty(body.suburb)
  body.address = nullIfEmpty(body.address)
  body.service_type = nullIfEmpty(body.service_type)
  body.description = nullIfEmpty(body.description)
  body.notes = nullIfEmpty(body.notes)
  return body
}

export async function POST(request: NextRequest) {
  const sb = createServerClient()
  const body = sanitiseJob(await request.json())
  const { data, error } = await sb
    .from('jobs')
    .insert(body)
    .select('*, client:clients(id,name,phone,suburb)')
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
