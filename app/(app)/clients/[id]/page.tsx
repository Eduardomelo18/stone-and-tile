'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/calculations'
import { jobStatusBadge, paymentStatusBadge } from '@/components/ui/Badge'
import type { Client, Job } from '@/lib/types'

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Client>>({})

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients/${id}`).then(r => r.json()),
      fetch(`/api/jobs?client_id=${id}`).then(r => r.json()),
    ]).then(([c, j]) => {
      setClient(c)
      setForm(c)
      setJobs(Array.isArray(j) ? j : [])
      setLoading(false)
    })
  }, [id])

  async function saveClient() {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const updated = await res.json()
    setClient(updated)
    setEditing(false)
  }

  async function deleteClient() {
    if (!confirm('Delete this client?')) return
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    router.push('/clients')
  }

  if (loading) return <div className="p-6 animate-pulse"><div className="h-8 bg-slate-200 rounded w-48 mb-4" /><div className="h-48 bg-slate-200 rounded-xl" /></div>
  if (!client) return <div className="p-6 text-red-600">Client not found.</div>

  const totalRevenue = jobs.filter(j => j.status === 'completed').reduce((s, j) => s + j.invoice_amount, 0)
  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/clients')} className="text-sm text-slate-500 hover:text-slate-700">← Clients</button>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="text-sm border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={deleteClient} className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">Delete</button>
        </div>
      </div>

      {/* Client Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-xs font-semibold text-slate-600 block mb-1">Name</label><input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></div>
              <div><label className="text-xs font-semibold text-slate-600 block mb-1">Phone</label><input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
              <div><label className="text-xs font-semibold text-slate-600 block mb-1">Email</label><input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} /></div>
              <div><label className="text-xs font-semibold text-slate-600 block mb-1">Address</label><input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} /></div>
              <div><label className="text-xs font-semibold text-slate-600 block mb-1">Suburb</label><input value={form.suburb || ''} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))} className={inputCls} /></div>
              <div className="col-span-2"><label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label><textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls} /></div>
            </div>
            <button onClick={saveClient} className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium">Save</button>
          </div>
        ) : (
          <div className="space-y-3">
            <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {client.phone && <div><span className="text-slate-500">Phone</span><p className="text-slate-900 font-medium">{client.phone}</p></div>}
              {client.email && <div><span className="text-slate-500">Email</span><p className="text-slate-900 font-medium">{client.email}</p></div>}
              {client.address && <div><span className="text-slate-500">Address</span><p className="text-slate-900 font-medium">{client.address}</p></div>}
              {client.suburb && <div><span className="text-slate-500">Suburb</span><p className="text-slate-900 font-medium">{client.suburb}</p></div>}
            </div>
            {client.notes && <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{client.notes}</p>}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <span className="text-xs text-emerald-600 font-semibold">Total Revenue from Client</span>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Jobs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Job History ({jobs.length})</h2>
          <Link href={`/jobs/new`} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg">+ New Job</Link>
        </div>
        {jobs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No jobs yet for this client.</p>
        ) : (
          <div className="space-y-2">
            {jobs.map(j => (
              <Link key={j.id} href={`/jobs/${j.id}`} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{j.date} · {j.service_type || 'No service'}</p>
                  <p className="text-xs text-slate-500">{j.suburb}</p>
                  <div className="flex gap-2 mt-1">{jobStatusBadge(j.status)}{paymentStatusBadge(j.payment_status)}</div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatCurrency(j.invoice_amount)}</p>
                  <span className="text-slate-300">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
