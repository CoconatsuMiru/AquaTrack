import type { TransactionHistoryRow } from '../../types/models'
import { TransactionTypeBadge } from './TransactionTypeBadge'

type TransactionsTableProps = {
  rows: TransactionHistoryRow[]
}

export function TransactionsTable({ rows }: TransactionsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-slate-500">No transactions found.</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-6 py-3 font-medium">Transaction</th>
            <th className="px-6 py-3 font-medium">Action</th>
            <th className="px-6 py-3 font-medium">Customer</th>
            <th className="px-6 py-3 font-medium">Container</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const createdAt = new Date(row.created_at)

            return (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-mono font-medium text-slate-900">#{row.transaction_number}</p>
                  <p className="text-xs text-slate-500">
                    {createdAt.toLocaleDateString()} ·{' '}
                    {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <TransactionTypeBadge type={row.transaction_type} />
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{row.customer_name}</p>
                  <p className="text-xs text-slate-500">{row.customer_phone ?? 'No phone'}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-mono font-medium text-slate-900">{row.container_number}</p>
                  <p className="text-xs text-slate-500">{row.container_type_name}</p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}