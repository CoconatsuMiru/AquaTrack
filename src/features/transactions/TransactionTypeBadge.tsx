import type { TransactionType } from '../../types/models'

const typeStyles: Record<TransactionType, { label: string; className: string }> = {
  assign: { label: 'Assigned', className: 'bg-brand-100 text-brand-700' },
  return: { label: 'Returned', className: 'bg-emerald-100 text-emerald-700' },
}

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const { label, className } = typeStyles[type]

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{label}</span>
  )
}