'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/calculations'
import type { Staff } from '@/lib/types'

export default function SettingsPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', hourly_rate: '', phone: '', email: '' })

  async function loadStaff() {
    const res = await fetch('/api/staff')
    const data = await res.json()
    setStaff(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { loadStaff() }, [])

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, hourly_rate: parseFloat(form.hourly_rate) || 0 }),
    })
    setForm({ name: '', role: '', hourly_rate: '', phone: '', email: '' })
    setShowForm(false)
    loadStaff()
  }

  async function deleteStaff(id: string) {
    if (!confirm('Remove this staff member?')) return
    await fetch(`/api/staff/${id}`, { method: 'DELETE' })
    loadStaff()
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Settings</h1>

      {/* Staff Management */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Staff & Rates</h2>
            <p className="text-xs text-slate-500">Manage your team and hourly rates</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-slate-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-slate-700">
            + Add Staff
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Add Staff Member</h3>
            <form onSubmit={handleAddStaff} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Jake Thompson" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Role</label>
                  <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inputCls} placeholder="Technician" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Hourly Rate ($/h)</label>
                  <input required type="number" step="0.01" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} className={inputCls} placeholder="40.00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="0412 000 000" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="border border-slate-200 px-5 py-2 rounded-lg text-sm text-slate-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : staff.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-400 mb-3">No staff added yet.</p>
            <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Add staff member</button>
          </div>
        ) : (
          <div className="space-y-2">
            {staff.map(s => (
              <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  <p className="text-sm text-slate-500">{s.role} · {formatCurrency(s.hourly_rate)}/hr</p>
                  {s.phone && <p className="text-xs text-slate-400">{s.phone}</p>}
                </div>
                <button onClick={() => deleteStaff(s.id)} className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-slate-900">About</h2>
        <div className="text-sm text-slate-600 space-y-1">
          <p>Stone & Tile Care Business Control v1.0</p>
          <p className="text-slate-400">Built with Next.js, Supabase, Tailwind CSS</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <strong>Supabase:</strong> Make sure your <code className="bg-amber-100 px-1 rounded">.env.local</code> is configured with your Supabase URL and keys. See <code>.env.local.example</code> for the template.
        </div>
      </div>

      {/* Service types reference */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-semibold text-slate-900 mb-3">Service Types Reference</h2>
        <div className="flex flex-wrap gap-2">
          {['Tile & Grout Cleaning', 'Stone Polishing', 'Sealing', 'Restoration', 'Pressure Washing', 'Stain Removal', 'Grout Recolouring', 'Other'].map(s => (
            <span key={s} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-md">{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
