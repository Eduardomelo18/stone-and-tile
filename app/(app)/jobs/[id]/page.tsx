'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  calcLabourTotal, calcMaterialsTotal, calcSealerTotal,
  calcTravelTotal, calcEquipmentTotal, calcOtherTotal,
  calcTotalDirectCost, calcGrossProfit, calcGrossMarginPct,
  formatCurrency, formatPct
} from '@/lib/calculations'
import { jobStatusBadge, paymentStatusBadge } from '@/components/ui/Badge'
import type {
  Job, JobCosts, JobLabour, JobMaterial, JobSealer,
  JobTravel, JobEquipment, JobOtherCost, Client, Staff
} from '@/lib/types'

// ─── helpers ────────────────────────────────────────────────────────────────
function num(v: string): number { return parseFloat(v) || 0 }

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <button onClick={onAdd} className="text-xs bg-slate-900 text-white px-2 py-1 rounded hover:bg-slate-700">+ Add</button>
    </div>
  )
}

function CostRow({ label, value, onDelete }: { label: string; value: number; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700 flex-1">{label}</span>
      <span className="text-sm font-medium text-slate-900 mr-3">{formatCurrency(value)}</span>
      <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700 px-1">✕</button>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [costs, setCosts] = useState<JobCosts>({ labour: [], materials: [], sealers: [], travel: [], equipment: [], other: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'costs'>('details')
  const [editingStatus, setEditingStatus] = useState(false)
  const [editJob, setEditJob] = useState<Partial<Job>>({})
  const [showEditForm, setShowEditForm] = useState(false)

  // Cost modals
  const [modal, setModal] = useState<string | null>(null)
  const [modalForm, setModalForm] = useState<Record<string, string>>({})
  const [staffList, setStaffList] = useState<Staff[]>([])

  async function loadData() {
    const [jobRes, costsRes, staffRes] = await Promise.all([
      fetch(`/api/jobs/${id}`),
      fetch(`/api/jobs/${id}/costs`),
      fetch('/api/staff'),
    ])
    const jobData = await jobRes.json()
    const costsData = await costsRes.json()
    const staffData = await staffRes.json()
    setJob(jobData)
    setEditJob(jobData)
    setCosts(costsData)
    setStaffList(Array.isArray(staffData) ? staffData : [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [id])

  async function updateJob(updates: Partial<Job>) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const updated = await res.json()
    setJob(updated)
    setEditJob(updated)
  }

  async function deleteJob() {
    if (!confirm('Delete this job? This cannot be undone.')) return
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
    router.push('/jobs')
  }

  async function addCostItem(table: string, body: Record<string, unknown>) {
    await fetch(`/api/jobs/${id}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await loadData()
  }

  async function deleteCostItem(table: string, rowId: string) {
    await fetch(`/api/jobs/${id}/${table}?row_id=${rowId}`, { method: 'DELETE' })
    await loadData()
  }

  async function openModal(type: string) {
    setModal(type)
    setModalForm({})
  }

  async function submitModal() {
    if (!modal) return
    const f = modalForm
    if (modal === 'labour') {
      await addCostItem('labour', {
        person_name: f.person_name || 'Labour',
        hours: 1,
        hourly_rate: num(f.fixed_amount),
      })
    } else if (modal === 'materials') {
      await addCostItem('materials', {
        item_name: f.item_name,
        quantity: num(f.quantity),
        unit: f.unit || '',
        unit_cost: num(f.unit_cost),
      })
    } else if (modal === 'sealers') {
      await addCostItem('sealers', {
        item_name: f.item_name,
        quantity: num(f.quantity),
        unit: f.unit || 'L',
        unit_cost: num(f.unit_cost),
      })
    } else if (modal === 'travel') {
      await addCostItem('travel', {
        fuel_cost: num(f.fuel_cost),
        tolls: num(f.tolls),
        parking: num(f.parking),
      })
    } else if (modal === 'equipment') {
      await addCostItem('equipment', {
        equipment_name: f.equipment_name,
        usage_cost: num(f.usage_cost),
        hire_cost: num(f.hire_cost),
        wear_and_tear_cost: num(f.wear_and_tear_cost),
      })
    } else if (modal === 'other') {
      await addCostItem('other-costs', {
        category: f.category,
        description: f.description || '',
        amount: num(f.amount),
      })
    }
    setModal(null)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-64" />
          <div className="h-48 bg-slate-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!job) return <div className="p-6 text-red-600">Job not found.</div>

  // ── Calculations ──
  const totalLabour = calcLabourTotal(costs)
  const totalMaterials = calcMaterialsTotal(costs)
  const totalSealer = calcSealerTotal(costs)
  const totalTravel = calcTravelTotal(costs)
  const totalEquipment = calcEquipmentTotal(costs)
  const totalOther = calcOtherTotal(costs)
  const totalDirect = calcTotalDirectCost(costs)
  const grossProfit = calcGrossProfit(job.invoice_amount, totalDirect)
  const marginPct = calcGrossMarginPct(job.invoice_amount, grossProfit)

  const client = job.client as Client | null
  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/jobs')} className="text-sm text-slate-500 hover:text-slate-700">← Jobs</button>
        <div className="flex gap-2">
          <button onClick={() => setShowEditForm(!showEditForm)} className="text-sm border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            {showEditForm ? 'Cancel Edit' : 'Edit Job'}
          </button>
          <button onClick={deleteJob} className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">
            Delete
          </button>
        </div>
      </div>

      {/* Job Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{client?.name || 'No client'}</h1>
            <p className="text-slate-500 text-sm">{job.address}{job.suburb ? `, ${job.suburb}` : ''}</p>
            <p className="text-slate-400 text-xs mt-0.5">{job.date}{job.start_time ? ` · ${job.start_time}` : ''}{job.end_time ? ` – ${job.end_time}` : ''}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {jobStatusBadge(job.status)}
            {paymentStatusBadge(job.payment_status)}
          </div>
        </div>

        {/* Quick status update */}
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Job Status</label>
            <select
              value={job.status}
              onChange={e => updateJob({ status: e.target.value as any })}
              className="border border-slate-200 rounded-lg px-2 py-1 text-sm"
            >
              <option value="booked">Booked</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Payment Status</label>
            <select
              value={job.payment_status}
              onChange={e => updateJob({ payment_status: e.target.value as any })}
              className="border border-slate-200 rounded-lg px-2 py-1 text-sm"
            >
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {showEditForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Edit Job</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Date</label>
              <input type="date" value={String(editJob.date || '')} onChange={e => setEditJob(j => ({ ...j, date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Service Type</label>
              <input value={String(editJob.service_type || '')} onChange={e => setEditJob(j => ({ ...j, service_type: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Address</label>
              <input value={String(editJob.address || '')} onChange={e => setEditJob(j => ({ ...j, address: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Suburb</label>
              <input value={String(editJob.suburb || '')} onChange={e => setEditJob(j => ({ ...j, suburb: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Quote ($)</label>
              <input type="number" step="0.01" value={String(editJob.quote_amount || '')} onChange={e => setEditJob(j => ({ ...j, quote_amount: parseFloat(e.target.value) }))} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Invoice ($)</label>
              <input type="number" step="0.01" value={String(editJob.invoice_amount || '')} onChange={e => setEditJob(j => ({ ...j, invoice_amount: parseFloat(e.target.value) }))} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Received ($)</label>
              <input type="number" step="0.01" value={String(editJob.payment_received || '')} onChange={e => setEditJob(j => ({ ...j, payment_received: parseFloat(e.target.value) }))} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Description</label>
              <textarea value={String(editJob.description || '')} onChange={e => setEditJob(j => ({ ...j, description: e.target.value }))} rows={3} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
              <textarea value={String(editJob.notes || '')} onChange={e => setEditJob(j => ({ ...j, notes: e.target.value }))} rows={2} className={inputCls} />
            </div>
          </div>
          <button
            onClick={() => { updateJob(editJob); setShowEditForm(false) }}
            className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-700"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(['details', 'costs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            {tab === 'costs' ? 'Cost Breakdown' : 'Details'}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <Row label="Client" value={client?.name || '—'} />
          <Row label="Phone" value={client?.phone || '—'} />
          <Row label="Service" value={job.service_type || '—'} />
          <Row label="Description" value={job.description || '—'} />
          <hr className="border-slate-100" />
          <Row label="Quote" value={formatCurrency(job.quote_amount)} />
          <Row label="Invoice" value={formatCurrency(job.invoice_amount)} bold />
          <Row label="Payment Received" value={formatCurrency(job.payment_received)} />
          <Row label="Outstanding" value={formatCurrency(job.invoice_amount - job.payment_received)} />
          {job.notes && <><hr className="border-slate-100" /><Row label="Notes" value={job.notes} /></>}
        </div>
      )}

      {activeTab === 'costs' && (
        <div className="space-y-4">
          {/* Labour */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <SectionHeader title="Labour" onAdd={() => openModal('labour')} />
            {costs.labour.length === 0 ? <p className="text-sm text-slate-400 py-2">No labour added yet.</p> : costs.labour.map(l => (
              <CostRow key={l.id} label={l.person_name} value={l.hours * l.hourly_rate} onDelete={() => deleteCostItem('labour', l.id)} />
            ))}
            <div className="text-right text-sm font-bold text-slate-900 pt-2">Total: {formatCurrency(totalLabour)}</div>
          </div>

          {/* Materials */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <SectionHeader title="Materials / Chemicals" onAdd={() => openModal('materials')} />
            {costs.materials.length === 0 ? <p className="text-sm text-slate-400 py-2">No materials added yet.</p> : costs.materials.map(m => (
              <CostRow key={m.id} label={`${m.item_name} · ${m.quantity} ${m.unit || ''} @ ${formatCurrency(m.unit_cost)}`} value={m.quantity * m.unit_cost} onDelete={() => deleteCostItem('materials', m.id)} />
            ))}
            <div className="text-right text-sm font-bold text-slate-900 pt-2">Total: {formatCurrency(totalMaterials)}</div>
          </div>

          {/* Sealers */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <SectionHeader title="Sealers" onAdd={() => openModal('sealers')} />
            {costs.sealers.length === 0 ? <p className="text-sm text-slate-400 py-2">No sealers added yet.</p> : costs.sealers.map(s => (
              <CostRow key={s.id} label={`${s.item_name} · ${s.quantity} ${s.unit || 'L'} @ ${formatCurrency(s.unit_cost)}`} value={s.quantity * s.unit_cost} onDelete={() => deleteCostItem('sealers', s.id)} />
            ))}
            <div className="text-right text-sm font-bold text-slate-900 pt-2">Total: {formatCurrency(totalSealer)}</div>
          </div>

          {/* Travel */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <SectionHeader title="Travel" onAdd={() => openModal('travel')} />
            {costs.travel.length === 0 ? <p className="text-sm text-slate-400 py-2">No travel costs added yet.</p> : costs.travel.map(t => (
              <CostRow key={t.id} label={`Fuel ${formatCurrency(t.fuel_cost)} · Tolls ${formatCurrency(t.tolls)} · Parking ${formatCurrency(t.parking)}`} value={t.fuel_cost + t.tolls + t.parking} onDelete={() => deleteCostItem('travel', t.id)} />
            ))}
            <div className="text-right text-sm font-bold text-slate-900 pt-2">Total: {formatCurrency(totalTravel)}</div>
          </div>

          {/* Equipment */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <SectionHeader title="Equipment" onAdd={() => openModal('equipment')} />
            {costs.equipment.length === 0 ? <p className="text-sm text-slate-400 py-2">No equipment costs added yet.</p> : costs.equipment.map(e => (
              <CostRow key={e.id} label={`${e.equipment_name} · Usage ${formatCurrency(e.usage_cost)} · Hire ${formatCurrency(e.hire_cost)} · W&T ${formatCurrency(e.wear_and_tear_cost)}`} value={e.usage_cost + e.hire_cost + e.wear_and_tear_cost} onDelete={() => deleteCostItem('equipment', e.id)} />
            ))}
            <div className="text-right text-sm font-bold text-slate-900 pt-2">Total: {formatCurrency(totalEquipment)}</div>
          </div>

          {/* Other */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <SectionHeader title="Other Direct Costs" onAdd={() => openModal('other')} />
            {costs.other.length === 0 ? <p className="text-sm text-slate-400 py-2">No other costs added yet.</p> : costs.other.map(o => (
              <CostRow key={o.id} label={`${o.category}${o.description ? ` · ${o.description}` : ''}`} value={o.amount} onDelete={() => deleteCostItem('other-costs', o.id)} />
            ))}
            <div className="text-right text-sm font-bold text-slate-900 pt-2">Total: {formatCurrency(totalOther)}</div>
          </div>

          {/* ── PROFIT SUMMARY ── */}
          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-base">Job Profit Summary</h3>
            <div className="space-y-2">
              <SummaryRow label="Invoice Amount" value={formatCurrency(job.invoice_amount)} />
              <SummaryRow label="Labour" value={`-${formatCurrency(totalLabour)}`} />
              <SummaryRow label="Materials" value={`-${formatCurrency(totalMaterials)}`} />
              <SummaryRow label="Sealers" value={`-${formatCurrency(totalSealer)}`} />
              <SummaryRow label="Travel" value={`-${formatCurrency(totalTravel)}`} />
              <SummaryRow label="Equipment" value={`-${formatCurrency(totalEquipment)}`} />
              <SummaryRow label="Other Direct Costs" value={`-${formatCurrency(totalOther)}`} />
              <hr className="border-slate-700" />
              <SummaryRow label="Total Direct Cost" value={formatCurrency(totalDirect)} />
              <hr className="border-slate-700" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Gross Profit</span>
                <span className={`font-bold text-xl ${grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(grossProfit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Gross Margin</span>
                <span className={`font-bold text-xl ${marginPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatPct(marginPct)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-slate-900 capitalize">Add {modal === 'other' ? 'Other Cost' : modal}</h2>
            {modal === 'labour' && (
              <>
                {staffList.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Pick Staff (auto-fills rate)</label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      value=""
                      onChange={e => {
                        const s = staffList.find(x => x.id === e.target.value)
                        if (s) setModalForm(f => ({ ...f, person_name: s.name, fixed_amount: String(s.hourly_rate) }))
                      }}
                    >
                      <option value="">— Select staff member —</option>
                      {staffList.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (${s.hourly_rate}/day)</option>
                      ))}
                    </select>
                  </div>
                )}
                <Field label="Who" value={modalForm.person_name || ''} onChange={v => setModalForm(f => ({ ...f, person_name: v }))} placeholder="e.g. Marco, Jake, Both" />
                <Field label="Labour Cost for this Job ($)" type="number" value={modalForm.fixed_amount || ''} onChange={v => setModalForm(f => ({ ...f, fixed_amount: v }))} placeholder="0.00" />
                <p className="text-xs text-slate-400">Pick a staff member to auto-fill their daily rate, or type a custom amount.</p>
              </>
            )}
            {(modal === 'materials' || modal === 'sealers') && (
              <>
                <Field label="Item Name" value={modalForm.item_name || ''} onChange={v => setModalForm(f => ({ ...f, item_name: v }))} placeholder={modal === 'sealers' ? 'Dry-Treat Stain-Proof' : 'Tile cleaner'} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Quantity" type="number" value={modalForm.quantity || ''} onChange={v => setModalForm(f => ({ ...f, quantity: v }))} placeholder="1" />
                  <Field label="Unit" value={modalForm.unit || ''} onChange={v => setModalForm(f => ({ ...f, unit: v }))} placeholder="L" />
                </div>
                <Field label="Unit Cost ($)" type="number" value={modalForm.unit_cost || ''} onChange={v => setModalForm(f => ({ ...f, unit_cost: v }))} placeholder="0.00" />
                {(modalForm.quantity && modalForm.unit_cost) && (
                  <p className="text-sm text-emerald-600 font-medium">Total: {formatCurrency(num(modalForm.quantity) * num(modalForm.unit_cost))}</p>
                )}
              </>
            )}
            {modal === 'travel' && (
              <>
                <Field label="Fuel Cost ($)" type="number" value={modalForm.fuel_cost || ''} onChange={v => setModalForm(f => ({ ...f, fuel_cost: v }))} placeholder="0.00" />
                <Field label="Tolls ($)" type="number" value={modalForm.tolls || ''} onChange={v => setModalForm(f => ({ ...f, tolls: v }))} placeholder="0.00" />
                <Field label="Parking ($)" type="number" value={modalForm.parking || ''} onChange={v => setModalForm(f => ({ ...f, parking: v }))} placeholder="0.00" />
              </>
            )}
            {modal === 'equipment' && (
              <>
                <Field label="Equipment Name" value={modalForm.equipment_name || ''} onChange={v => setModalForm(f => ({ ...f, equipment_name: v }))} placeholder="Pressure washer" />
                <Field label="Usage Cost ($)" type="number" value={modalForm.usage_cost || ''} onChange={v => setModalForm(f => ({ ...f, usage_cost: v }))} placeholder="0.00" />
                <Field label="Hire Cost ($)" type="number" value={modalForm.hire_cost || ''} onChange={v => setModalForm(f => ({ ...f, hire_cost: v }))} placeholder="0.00" />
                <Field label="Wear & Tear ($)" type="number" value={modalForm.wear_and_tear_cost || ''} onChange={v => setModalForm(f => ({ ...f, wear_and_tear_cost: v }))} placeholder="0.00" />
              </>
            )}
            {modal === 'other' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Category</label>
                  <select value={modalForm.category || ''} onChange={e => setModalForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">— Select —</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Rubbish Removal">Rubbish Removal</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Meals">Meals</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>
                <Field label="Description" value={modalForm.description || ''} onChange={v => setModalForm(f => ({ ...f, description: v }))} placeholder="Details..." />
                <Field label="Amount ($)" type="number" value={modalForm.amount || ''} onChange={v => setModalForm(f => ({ ...f, amount: v }))} placeholder="0.00" />
              </>
            )}
            <div className="flex gap-3">
              <button onClick={submitModal} className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-700">Save</button>
              <button onClick={() => setModal(null)} className="flex-1 border border-slate-200 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-slate-500 min-w-0 shrink-0">{label}</span>
      <span className={`text-sm text-right min-w-0 ${bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{value}</span>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-slate-300">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 block mb-1">{label}</label>
      <input
        type={type}
        step={type === 'number' ? '0.01' : undefined}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
      />
    </div>
  )
}
