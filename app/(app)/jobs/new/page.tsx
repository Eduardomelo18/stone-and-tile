'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Client } from '@/lib/types'

const SERVICE_TYPES = [
  'Tile & Grout Cleaning', 'Stone Polishing', 'Sealing', 'Restoration',
  'Pressure Washing', 'Stain Removal', 'Grout Recolouring', 'Other',
]

export default function NewJobPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    address: '',
    suburb: '',
    service_type: '',
    description: '',
    quote_amount: '',
    invoice_amount: '',
    payment_received: '0',
    payment_status: 'unpaid',
    status: 'booked',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : []))
  }, [])

  // Auto-fill address from client
  function handleClientChange(clientId: string) {
    const c = clients.find(c => c.id === clientId)
    setForm(f => ({
      ...f,
      client_id: clientId,
      address: c?.address || f.address,
      suburb: c?.suburb || f.suburb,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body = {
      ...form,
      quote_amount: parseFloat(form.quote_amount) || 0,
      invoice_amount: parseFloat(form.invoice_amount) || 0,
      payment_received: parseFloat(form.payment_received) || 0,
      client_id: form.client_id || null,
    }
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const job = await res.json()
      router.push(`/jobs/${job.id}`)
    } else {
      alert('Error creating job. Check your Supabase setup.')
      setSaving(false)
    }
  }

  const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1"

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700 mb-2">← Back</button>
        <h1 className="text-xl font-bold text-slate-900">New Job</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client & Date */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Job Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Client</label>
              <select
                value={form.client_id}
                onChange={e => handleClientChange(e.target.value)}
                className={inputClass}
              >
                <option value="">— Select client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Service Type</label>
              <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} className={inputClass}>
                <option value="">— Select —</option>
                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Start Time</label>
              <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Location</h2>
          <div>
            <label className={labelClass}>Property Address</label>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="14 Rose St" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Suburb</label>
            <input value={form.suburb} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))} placeholder="Mosman" className={inputClass} />
          </div>
        </div>

        {/* Financials */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Financials</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quote Amount ($)</label>
              <input type="number" step="0.01" min="0" value={form.quote_amount} onChange={e => setForm(f => ({ ...f, quote_amount: e.target.value }))} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Invoice Amount ($) *</label>
              <input type="number" step="0.01" min="0" required value={form.invoice_amount} onChange={e => setForm(f => ({ ...f, invoice_amount: e.target.value }))} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Payment Received ($)</label>
              <input type="number" step="0.01" min="0" value={form.payment_received} onChange={e => setForm(f => ({ ...f, payment_received: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Payment Status</label>
              <select value={form.payment_status} onChange={e => setForm(f => ({ ...f, payment_status: e.target.value }))} className={inputClass}>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Job Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputClass}>
                <option value="booked">Booked</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Description & Notes</h2>
          <div>
            <label className={labelClass}>Job Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={inputClass} placeholder="Describe the work to be done..." />
          </div>
          <div>
            <label className={labelClass}>Internal Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputClass} placeholder="Any internal notes..." />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Creating job...' : 'Create Job & Add Costs →'}
        </button>
      </form>
    </div>
  )
}
