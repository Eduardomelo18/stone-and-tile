'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/calculations'
import { jobStatusBadge, paymentStatusBadge } from '@/components/ui/Badge'
import type { Job } from '@/lib/types'

const SERVICE_TYPES = [
  'Tile & Grout Cleaning', 'Stone Polishing', 'Sealing', 'Restoration',
  'Pressure Washing', 'Stain Removal', 'Grout Recolouring', 'Other',
]

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    suburb: '',
  })

  function loadJobs() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.payment_status) params.set('payment_status', filters.payment_status)
    if (filters.suburb) params.set('suburb', filters.suburb)
    fetch('/api/jobs?' + params)
      .then(r => r.json())
      .then(d => setJobs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadJobs() }, [filters])

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Jobs</h1>
        <Link
          href="/jobs/new"
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700"
        >
          + New Job
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="booked">Booked</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filters.payment_status}
          onChange={e => setFilters(f => ({ ...f, payment_status: e.target.value }))}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
        >
          <option value="">All Payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
        <input
          placeholder="Filter by suburb"
          value={filters.suburb}
          onChange={e => setFilters(f => ({ ...f, suburb: e.target.value }))}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm col-span-2 lg:col-span-1"
        />
        <button
          onClick={() => setFilters({ status: '', payment_status: '', suburb: '' })}
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Clear filters
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-lg mb-4">No jobs found</p>
          <Link href="/jobs/new" className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium">
            Create your first job
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {jobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{(job.client as any)?.name || 'No client'}</p>
                    <p className="text-xs text-slate-500">{job.suburb} · {job.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(job.invoice_amount)}</p>
                    <p className="text-xs text-slate-400">{job.service_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {jobStatusBadge(job.status)}
                  {paymentStatusBadge(job.payment_status)}
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Client</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Suburb</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Service</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Invoice</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href = `/jobs/${job.id}`}>
                    <td className="px-4 py-3 text-slate-600">{job.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{(job.client as any)?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{job.suburb || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{job.service_type || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(job.invoice_amount)}</td>
                    <td className="px-4 py-3 text-center">{jobStatusBadge(job.status)}</td>
                    <td className="px-4 py-3 text-center">{paymentStatusBadge(job.payment_status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
