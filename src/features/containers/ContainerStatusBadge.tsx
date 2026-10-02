import type { ContainerStatus } from '../../types/models'

const statusStyles: Record<ContainerStatus, { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-emerald-100 text-emerald-700' },
  with_customer: { label: 'With customer', className: 'bg-brand-100 text-brand-700' },
  retired: { label: 'Retired', className: 'bg-slate-200 text-slate-600' },
}

export function ContainerStatusBadge({ status }: { status: ContainerStatus }) {
  const { label, className } = statusStyles[status]

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{label}</span>
  )
}