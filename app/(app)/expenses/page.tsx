'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/calculations'
import { calcMonthlyOverhead, calcYearlyOverhead, toMonthlyAmount } from '@/lib/calculations'
import type { CompanyExpense, ExpenseFrequency } from '@/lib/types'

const CATEGORIES = [
  'Rent', 'Insurance', 'Vehicle', 'Fuel', 'Marketing', 'Software',
  'Accounting', 'Admin Wages', 'Tools', 'Storage', 'Phone', 'Licenses', 'Other',
]

const FREQ_LABELS: Record<ExpenseFrequency, string> = {
  weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<CompanyExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    category: '',
    description: '',
    amount: '',
    frequency: 'monthly' as ExpenseFrequency,
    expense_date: '',
    notes: '',
  })

  async function loadExpenses() {
    const res = await fetch('/api/expenses')
    const data = await res.json()
    setExpenses(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { loadExpenses() }, [])

  function startEdit(e: CompanyExpense) {
    setEditingId(e.id)
    setForm({
      category: e.category,
      description: e.description || '',
      amount: String(e.amount),
      frequency: e.frequency,
      expense_date: e.expense_date || '',
      notes: e.notes || '',
    })
    setShowForm(true)
  }

  function resetForm() {
    setEditingId(null)
    setForm({ category: '', description: '', amount: '', frequency: 'monthly', expense_date: '', notes: '' })
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { ...form, amount: parseFloat(form.amount) || 0 }
    if (editingId) {
      await fetch(`/api/expenses/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    await loadExpenses()
    resetForm()
  }

  async function deleteExpense(id: string) {
    if (!confirm('Delete this expense?')) return
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    await loadExpenses()
  }

  const monthlyTotal = calcMonthlyOverhead(expenses)
  const yearlyTotal = calcYearlyOverhead(expenses)

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1"

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Expenses & Overheads</h1>
          <p className="text-sm text-slate-500">Fixed business costs (not job-specific)</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700"
        >
          + Add Expense
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Monthly Overhead</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(monthlyTotal)}</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Yearly Overhead</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(yearlyTotal)}</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-4">{editingId ? 'Edit' : 'Add'} Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category *</label>
                <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                  <option value="">— Select —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Frequency *</label>
                <select required value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value as ExpenseFrequency }))} className={inputCls}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="Brief description" />
              </div>
              <div>
                <label className={labelCls}>Amount ($) *</label>
                <input required type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} placeholder="0.00" />
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} placeholder="Optional notes" />
              </div>
            </div>
            {form.amount && form.frequency && (
              <p className="text-sm text-slate-600">
                Monthly equivalent: <strong className="text-amber-600">{formatCurrency(toMonthlyAmount(parseFloat(form.amount) || 0, form.frequency))}</strong>
              </p>
            )}
            <div className="flex gap-3">
              <button type="submit" className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-700">
                {editingId ? 'Save Changes' : 'Add Expense'}
              </button>
              <button type="button" onClick={resetForm} className="border border-slate-200 px-5 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : expenses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-400 mb-4">No expenses added yet.</p>
          <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm">Add your first expense</button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden md:table-cell">Description</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Amount</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600">Frequency</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Monthly</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{e.category}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{e.description || '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-medium">
                      {FREQ_LABELS[e.frequency]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-amber-600">{formatCurrency(toMonthlyAmount(e.amount, e.frequency))}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => startEdit(e)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => deleteExpense(e.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold">
              <tr>
                <td className="px-4 py-3 text-slate-700" colSpan={4}>Total Monthly Overhead</td>
                <td className="px-4 py-3 text-right text-amber-600 text-base">{formatCurrency(monthlyTotal)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
