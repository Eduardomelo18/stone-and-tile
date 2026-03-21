interface StatCardProps {
  label: string
  value: string
  sub?: string
  color?: 'default' | 'green' | 'red' | 'blue' | 'amber'
}

const colorMap = {
  default: { value: 'text-slate-900', bg: 'bg-white' },
  green: { value: 'text-emerald-600', bg: 'bg-white' },
  red: { value: 'text-red-600', bg: 'bg-white' },
  blue: { value: 'text-blue-600', bg: 'bg-white' },
  amber: { value: 'text-amber-600', bg: 'bg-white' },
}

export default function StatCard({ label, value, sub, color = 'default' }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={`${c.bg} rounded-xl border border-slate-200 shadow-sm p-4`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}
