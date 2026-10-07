import type { TopHolders } from '../../services/dashboard'

type TopHoldersCardProps = {
  topHolders: TopHolders
}

export function TopHoldersCard({ topHolders }: TopHoldersCardProps) {
  const { holders, total } = topHolders

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Customers holding containers</h2>
        {total > 0 && <span className="text-xs font-medium text-slate-500">{total} total</span>}
      </div>

      {holders.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-500">
          No containers are currently out.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {holders.map((holder) => (
            <li key={holder.customer_id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{holder.full_name}</p>
                <p className="text-xs text-slate-500">{holder.phone ?? 'No phone'}</p>
              </div>
              <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
                {holder.containers_held} {holder.containers_held === 1 ? 'container' : 'containers'}
              </span>
            </li>
          ))}
        </ul>
      )}

      {total > holders.length && (
        <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          Showing the top {holders.length} of {total} customers.
        </p>
      )}
    </div>
  )
}