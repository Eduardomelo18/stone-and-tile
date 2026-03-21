import { createServerClient } from '@/lib/supabase'
import { calcMonthlyOverhead, calcYearlyOverhead, buildJobWithCosts, calcTotalDirectCost } from '@/lib/calculations'
import type { CompanyExpense, JobCosts } from '@/lib/types'

export async function GET() {
  const sb = createServerClient()

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [jobsRes, expensesRes] = await Promise.all([
    sb.from('jobs').select('*').not('status', 'eq', 'cancelled'),
    sb.from('company_expenses').select('*'),
  ])

  const jobs = jobsRes.data ?? []
  const expenses = (expensesRes.data ?? []) as CompanyExpense[]

  const monthlyOverhead = calcMonthlyOverhead(expenses)
  const yearlyOverhead = calcYearlyOverhead(expenses)

  const completedJobs = jobs.filter(j => j.status === 'completed')
  const totalRevenue = completedJobs.reduce((s, j) => s + (j.invoice_amount || 0), 0)

  // Fetch costs for completed jobs to calculate direct costs
  const costPromises = completedJobs.map(async (job) => {
    const [labour, materials, sealers, travel, equipment, other] = await Promise.all([
      sb.from('job_labour').select('*').eq('job_id', job.id),
      sb.from('job_materials').select('*').eq('job_id', job.id),
      sb.from('job_sealers').select('*').eq('job_id', job.id),
      sb.from('job_travel').select('*').eq('job_id', job.id),
      sb.from('job_equipment').select('*').eq('job_id', job.id),
      sb.from('job_other_costs').select('*').eq('job_id', job.id),
    ])
    const costs: JobCosts = {
      labour: labour.data ?? [],
      materials: materials.data ?? [],
      sealers: sealers.data ?? [],
      travel: travel.data ?? [],
      equipment: equipment.data ?? [],
      other: other.data ?? [],
    }
    return calcTotalDirectCost(costs)
  })
  const directCosts = await Promise.all(costPromises)
  const totalDirectCosts = directCosts.reduce((s, c) => s + c, 0)

  const grossProfit = totalRevenue - totalDirectCosts
  const netProfit = grossProfit - monthlyOverhead * 12

  const weekStartStr = weekStart.toISOString().split('T')[0]
  const monthStartStr = monthStart.toISOString().split('T')[0]

  const weekJobs = completedJobs.filter(j => j.date >= weekStartStr)
  const monthJobs = completedJobs.filter(j => j.date >= monthStartStr)

  return Response.json({
    total_revenue: totalRevenue,
    total_direct_costs: totalDirectCosts,
    gross_profit: grossProfit,
    monthly_overhead: monthlyOverhead,
    yearly_overhead: yearlyOverhead,
    net_profit: netProfit,
    jobs_booked: jobs.filter(j => j.status === 'booked').length,
    jobs_completed: completedJobs.length,
    jobs_unpaid: jobs.filter(j => j.payment_status === 'unpaid').length,
    profit_this_week: weekJobs.reduce((s, j) => s + (j.invoice_amount || 0), 0),
    profit_this_month: monthJobs.reduce((s, j) => s + (j.invoice_amount || 0), 0),
  })
}
