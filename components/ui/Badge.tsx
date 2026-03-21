type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange'

const variants: Record<BadgeVariant, string> = {
  green: 'bg-emerald-100 text-emerald-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-slate-100 text-slate-700',
  orange: 'bg-orange-100 text-orange-800',
}

interface BadgeProps {
  label: string
  variant?: BadgeVariant
}

export default function Badge({ label, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}

export function jobStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    booked: { label: 'Booked', variant: 'blue' },
    in_progress: { label: 'In Progress', variant: 'orange' },
    completed: { label: 'Completed', variant: 'green' },
    cancelled: { label: 'Cancelled', variant: 'red' },
  }
  const m = map[status] || { label: status, variant: 'gray' as BadgeVariant }
  return <Badge label={m.label} variant={m.variant} />
}

export function paymentStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    unpaid: { label: 'Unpaid', variant: 'red' },
    partial: { label: 'Partial', variant: 'yellow' },
    paid: { label: 'Paid', variant: 'green' },
  }
  const m = map[status] || { label: status, variant: 'gray' as BadgeVariant }
  return <Badge label={m.label} variant={m.variant} />
}
