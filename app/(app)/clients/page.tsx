'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Client } from '@/lib/types'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', suburb: '', notes: '' })

  async function loadClients() {
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    const res = await fetch('/api/clients' + params)
    const data = await res.json()
    setClients(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    const t = setTimeout(loadClients, 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { loadClients() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ name: '', phone: '', email: '', address: '', suburb: '', notes: '' })
    setShowForm(false)
    loadClients()
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Clients</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700">
          + New Client
        </button>
      </div>

      {/* Search */}
      <input
        placeholder="Search clients by name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
      />

      {/* Add Client Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-4">New Client</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Sarah Johnson" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="0411 000 000" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} placeholder="14 Rose St" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Suburb</label>
                <input value={form.suburb} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))} className={inputCls} placeholder="Mosman" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium">Save Client</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-slate-200 px-5 py-2 rounded-lg text-sm text-slate-600">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Client List */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : clients.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-400 mb-4">No clients found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map(c => (
            <Link key={c.id} href={`/clients/${c.id}`} className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  <p className="text-sm text-slate-500">{[c.suburb, c.phone].filter(Boolean).join(' · ')}</p>
                </div>
                <span className="text-slate-300">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
