import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/jobs/[id]/costs'>) {
  const { id } = await ctx.params
  const sb = createServerClient()

  const [labour, materials, sealers, travel, equipment, other] = await Promise.all([
    sb.from('job_labour').select('*').eq('job_id', id),
    sb.from('job_materials').select('*').eq('job_id', id),
    sb.from('job_sealers').select('*').eq('job_id', id),
    sb.from('job_travel').select('*').eq('job_id', id),
    sb.from('job_equipment').select('*').eq('job_id', id),
    sb.from('job_other_costs').select('*').eq('job_id', id),
  ])

  return Response.json({
    labour: labour.data ?? [],
    materials: materials.data ?? [],
    sealers: sealers.data ?? [],
    travel: travel.data ?? [],
    equipment: equipment.data ?? [],
    other: other.data ?? [],
  })
}
