'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { jobStatusBadge } from '@/components/ui/Badge'
import type { Job } from '@/lib/types'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const statusColors: Record<string, string> = {
  booked: 'bg-blue-500',
  in_progress: 'bg-orange-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-slate-400',
}

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const from = new Date(year, month, 1).toISOString().split('T')[0]
    const to = new Date(year, month + 1, 0).toISOString().split('T')[0]
    setLoading(true)
    fetch(`/api/jobs?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(d => setJobs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [year, month])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const jobsByDate: Record<string, Job[]> = {}
  jobs.forEach(j => {
    if (!jobsByDate[j.date]) jobsByDate[j.date] = []
    jobsByDate[j.date].push(j)
  })

  const selectedJobs = selectedDate ? (jobsByDate[selectedDate] || []) : []

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Calendar</h1>
        <Link href="/jobs/new" className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700">
          + New Job
        </Link>
      </div>

      {/* Month nav */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">‹</button>
          <h2 className="font-bold text-slate-900">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-100">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white h-16 lg:h-20" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayJobs = jobsByDate[dateStr] || []
            const isToday = dateStr === today.toISOString().split('T')[0]
            const isSelected = dateStr === selectedDate
            return (
              <div
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`bg-white h-16 lg:h-20 p-1 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? 'ring-2 ring-slate-900 ring-inset' : ''}`}
              >
                <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-slate-900 text-white' : 'text-slate-700'}`}>
                  {day}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayJobs.slice(0, 2).map(j => (
                    <div key={j.id} className={`text-white text-xs px-1 rounded truncate ${statusColors[j.status]}`}>
                      {(j.client as any)?.name?.split(' ')[0] || 'Job'}
                    </div>
                  ))}
                  {dayJobs.length > 2 && <div className="text-xs text-slate-400">+{dayJobs.length - 2} more</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries(statusColors).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className={`w-3 h-3 rounded ${c}`} />
            {s.replace('_', ' ')}
          </div>
        ))}
      </div>

      {/* Selected day panel */}
      {selectedDate && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Jobs on {selectedDate}</h3>
            <Link href="/jobs/new" className="text-xs bg-slate-900 text-white px-3 py-1 rounded-lg">+ Add</Link>
          </div>
          {selectedJobs.length === 0 ? (
            <p className="text-sm text-slate-400">No jobs on this date.</p>
          ) : (
            <div className="space-y-2">
              {selectedJobs.map(j => (
                <Link key={j.id} href={`/jobs/${j.id}`} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-slate-300">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{(j.client as any)?.name || 'No client'}</p>
                    <p className="text-xs text-slate-500">{j.service_type || 'No service type'} · {j.suburb}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {jobStatusBadge(j.status)}
                    <span className="text-slate-300">›</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
