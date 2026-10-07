import { Link } from 'react-router-dom'
import type { TransactionHistoryRow } from '../../types/models'
import { TransactionTypeBadge } from '../transactions/TransactionTypeBadge'

type RecentActivityCardProps = {
  rows: TransactionHistoryRow[]
}

export function RecentActivityCard({ rows }: RecentActivityCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Recent activity</h2>
        <Link
          to="/transactions"
          className="text-sm font-medium text-brand-600 hover:text-brand-800"
        >
          View all
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-500">No activity yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{row.customer_name}</p>
                <p className="text-xs text-slate-500">
                  <span className="font-mono">{row.container_number}</span> ·{' '}
                  {new Date(row.created_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <TransactionTypeBadge type={row.transaction_type} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}