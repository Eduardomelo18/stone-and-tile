'use client'

import { useEffect, useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import { formatCurrency } from '@/lib/calculations'
import type { DashboardStats } from '@/lib/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setStats(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return <div className="p-6 text-red-600">Failed to load dashboard.</div>

  const marginPct = stats.total_revenue > 0
    ? ((stats.gross_profit / stats.total_revenue) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Business overview</p>
        </div>
        <a
          href="/jobs/new"
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          + New Job
        </a>
      </div>

      {/* Financial Summary */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Financial</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Revenue" value={formatCurrency(stats.total_revenue)} color="blue" />
          <StatCard label="Direct Job Costs" value={formatCurrency(stats.total_direct_costs)} color="red" />
          <StatCard label="Gross Profit" value={formatCurrency(stats.gross_profit)} sub={`${marginPct}% margin`} color="green" />
          <StatCard label="Net Profit" value={formatCurrency(stats.net_profit)} sub="after overheads" color={stats.net_profit >= 0 ? 'green' : 'red'} />
        </div>
      </div>

      {/* GST */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">GST (10%)</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="GST Owed (All Time)" value={formatCurrency(stats.total_gst)} sub="to pay to ATO" color="blue" />
          <StatCard label="GST Owed This Month" value={formatCurrency(stats.gst_this_month)} sub="to pay to ATO" color="blue" />
        </div>
      </div>

      {/* Overhead */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Overheads</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Monthly Overhead" value={formatCurrency(stats.monthly_overhead)} color="amber" />
          <StatCard label="Yearly Overhead" value={formatCurrency(stats.yearly_overhead)} color="amber" />
        </div>
      </div>

      {/* Jobs */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Jobs</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Booked" value={String(stats.jobs_booked)} color="blue" />
          <StatCard label="Completed" value={String(stats.jobs_completed)} color="green" />
          <StatCard label="Unpaid" value={String(stats.jobs_unpaid)} color="red" />
          <StatCard label="This Month Revenue" value={formatCurrency(stats.profit_this_month)} color="amber" />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'View All Jobs', href: '/jobs', icon: '🔧' },
            { label: 'Calendar', href: '/calendar', icon: '📅' },
            { label: 'Expenses', href: '/expenses', icon: '💸' },
            { label: 'Reports', href: '/reports', icon: '📊' },
          ].map(a => (
            <a
              key={a.href}
              href={a.href}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-slate-400 transition-colors"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-sm font-medium text-slate-700">{a.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
