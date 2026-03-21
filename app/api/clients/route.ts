import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const sb = createServerClient()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  let query = sb.from('clients').select('*').order('name')
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const sb = createServerClient()
  const body = await request.json()
  const { data, error } = await sb.from('clients').insert(body).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
