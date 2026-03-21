'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  formatCurrency, formatPct,
  calcTotalDirectCost, calcGrossProfit, calcGrossMarginPct,
  calcMonthlyOverhead, calcYearlyOverhead
} from '@/lib/calculations'
import type { Job, JobCosts, CompanyExpense } from '@/lib/types'

interface JobReport {
  job: Job
  directCost: number
  grossProfit: number
  marginPct: number
}

type Period = 'week' | 'month' | 'quarter' | 'year' | 'all'

function getPeriodDates(period: Period): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString().split('T')[0]
  if (period === 'week') {
    const d = new Date(now); d.setDate(d.getDate() - 7)
    return { from: d.toISOString().split('T')[0], to }
  }
  if (period === 'month') {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], to }
  }
  if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3)
    return { from: new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0], to }
  }
  if (period === 'year') {
    return { from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0], to }
  }
  return { from: '2020-01-01', to }
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [reports, setReports] = useState<JobReport[]>([])
  const [expenses, setExpenses] = useState<CompanyExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'profit' | 'margin' | 'revenue'>('date')

  async function loadReports() {
    setLoading(true)
    const { from, to } = period === 'all' && customFrom && customTo
      ? { from: customFrom, to: customTo }
      : getPeriodDates(period)

    const [jobsRes, expensesRes] = await Promise.all([
      fetch(`/api/jobs?from=${from}&to=${to}&status=completed`).then(r => r.json()),
      fetch('/api/expenses').then(r => r.json()),
    ])

    const jobs: Job[] = Array.isArray(jobsRes) ? jobsRes : []
    setExpenses(Array.isArray(expensesRes) ? expensesRes : [])

    // Load costs for all jobs in parallel
    const reportData = await Promise.all(
      jobs.map(async (job) => {
        const costsRes = await fetch(`/api/jobs/${job.id}/costs`)
        const costs: JobCosts = await costsRes.json()
        const directCost = calcTotalDirectCost(costs)
        const grossProfit = calcGrossProfit(job.invoice_amount, directCost)
        const marginPct = calcGrossMarginPct(job.invoice_amount, grossProfit)
        return { job, directCost, grossProfit, marginPct }
      })
    )
    setReports(reportData)
    setLoading(false)
  }

  useEffect(() => { loadReports() }, [period])

  const sorted = [...reports].sort((a, b) => {
    if (sortBy === 'profit') return b.grossProfit - a.grossProfit
    if (sortBy === 'margin') return b.marginPct - a.marginPct
    if (sortBy === 'revenue') return b.job.invoice_amount - a.job.invoice_amount
    return b.job.date.localeCompare(a.job.date)
  })

  const totalRevenue = reports.reduce((s, r) => s + r.job.invoice_amount, 0)
  const totalDirectCost = reports.reduce((s, r) => s + r.directCost, 0)
  const totalGrossProfit = totalRevenue - totalDirectCost
  const avgMargin = reports.length > 0 ? reports.reduce((s, r) => s + r.marginPct, 0) / reports.length : 0
  const monthlyOverhead = calcMonthlyOverhead(expenses)
  const netProfit = totalGrossProfit - monthlyOverhead

  // Service type breakdown
  const byService: Record<string, { revenue: number; profit: number; count: number }> = {}
  reports.forEach(r => {
    const s = r.job.service_type || 'Other'
    if (!byService[s]) byService[s] = { revenue: 0, profit: 0, count: 0 }
    byService[s].revenue += r.job.invoice_amount
    byService[s].profit += r.grossProfit
    byService[s].count++
  })

  // Suburb breakdown
  const bySuburb: Record<string, { revenue: number; profit: number; count: number }> = {}
  reports.forEach(r => {
    const s = r.job.suburb || 'Unknown'
    if (!bySuburb[s]) bySuburb[s] = { revenue: 0, profit: 0, count: 0 }
    bySuburb[s].revenue += r.job.invoice_amount
    bySuburb[s].profit += r.grossProfit
    bySuburb[s].count++
  })

  const PERIODS: { value: Period; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'Custom Range' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-xl font-bold text-slate-900">Reports</h1>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === p.value ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === 'all' && (
        <div className="flex gap-3 flex-wrap">
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          <button onClick={loadReports} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Apply</button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Revenue" value={formatCurrency(totalRevenue)} />
        <Stat label="Direct Costs" value={formatCurrency(totalDirectCost)} sub="job costs only" />
        <Stat label="Gross Profit" value={formatCurrency(totalGrossProfit)} sub={`${avgMargin.toFixed(1)}% avg margin`} green={totalGrossProfit >= 0} />
        <Stat label="Net Profit" value={formatCurrency(netProfit)} sub="after monthly overhead" green={netProfit >= 0} />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : reports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-400">No completed jobs in this period.</p>
        </div>
      ) : (
        <>
          {/* Profit by Service */}
          {Object.keys(byService).length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Profit by Service Type</h2>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-2 text-left text-slate-600">Service</th>
                  <th className="px-4 py-2 text-center text-slate-600">Jobs</th>
                  <th className="px-4 py-2 text-right text-slate-600">Revenue</th>
                  <th className="px-4 py-2 text-right text-slate-600">Profit</th>
                </tr></thead>
                <tbody>
                  {Object.entries(byService).sort((a, b) => b[1].profit - a[1].profit).map(([s, d]) => (
                    <tr key={s} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-900">{s}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{d.count}</td>
                      <td className="px-4 py-2 text-right text-slate-700">{formatCurrency(d.revenue)}</td>
                      <td className={`px-4 py-2 text-right font-semibold ${d.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(d.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Profit by Suburb */}
          {Object.keys(bySuburb).length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Profit by Suburb</h2>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-2 text-left text-slate-600">Suburb</th>
                  <th className="px-4 py-2 text-center text-slate-600">Jobs</th>
                  <th className="px-4 py-2 text-right text-slate-600">Revenue</th>
                  <th className="px-4 py-2 text-right text-slate-600">Profit</th>
                </tr></thead>
                <tbody>
                  {Object.entries(bySuburb).sort((a, b) => b[1].profit - a[1].profit).map(([s, d]) => (
                    <tr key={s} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-900">{s}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{d.count}</td>
                      <td className="px-4 py-2 text-right text-slate-700">{formatCurrency(d.revenue)}</td>
                      <td className={`px-4 py-2 text-right font-semibold ${d.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(d.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Job-level table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Profit by Job</h2>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="border border-slate-200 rounded-lg px-2 py-1 text-xs">
                <option value="date">Sort: Date</option>
                <option value="profit">Sort: Profit ↓</option>
                <option value="margin">Sort: Margin ↓</option>
                <option value="revenue">Sort: Revenue ↓</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-2 text-left text-slate-600">Date</th>
                  <th className="px-4 py-2 text-left text-slate-600">Client</th>
                  <th className="px-4 py-2 text-left text-slate-600 hidden md:table-cell">Service</th>
                  <th className="px-4 py-2 text-right text-slate-600">Revenue</th>
                  <th className="px-4 py-2 text-right text-slate-600">Cost</th>
                  <th className="px-4 py-2 text-right text-slate-600">Profit</th>
                  <th className="px-4 py-2 text-right text-slate-600">Margin</th>
                </tr></thead>
                <tbody>
                  {sorted.map(({ job, directCost, grossProfit, marginPct }) => (
                    <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href = `/jobs/${job.id}`}>
                      <td className="px-4 py-2 text-slate-600">{job.date}</td>
                      <td className="px-4 py-2 font-medium text-slate-900">{(job.client as any)?.name || '—'}</td>
                      <td className="px-4 py-2 text-slate-600 hidden md:table-cell">{job.service_type || '—'}</td>
                      <td className="px-4 py-2 text-right text-slate-700">{formatCurrency(job.invoice_amount)}</td>
                      <td className="px-4 py-2 text-right text-red-600">{formatCurrency(directCost)}</td>
                      <td className={`px-4 py-2 text-right font-semibold ${grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(grossProfit)}</td>
                      <td className={`px-4 py-2 text-right font-semibold ${marginPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatPct(marginPct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, sub, green }: { label: string; value: string; sub?: string; green?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${green !== undefined ? (green ? 'text-emerald-600' : 'text-red-600') : 'text-slate-900'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}
