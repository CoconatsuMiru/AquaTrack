import type { ContainerWithDetails } from '../../services/containers'
import { ContainerStatusBadge } from './ContainerStatusBadge'

type ContainersTableProps = {
  containers: ContainerWithDetails[]
  onRetire: (container: ContainerWithDetails) => void
  onRestore: (container: ContainerWithDetails) => void
}

export function ContainersTable({ containers, onRetire, onRestore }: ContainersTableProps) {
  if (containers.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-slate-500">No containers found.</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-6 py-3 font-medium">Container</th>
            <th className="px-6 py-3 font-medium">Type</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Held by</th>
            <th className="px-6 py-3 font-medium">Added</th>
            <th className="px-6 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {containers.map((container) => (
            <tr key={container.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-mono font-medium text-slate-900">
                {container.container_number}
              </td>
              <td className="px-6 py-4 text-slate-700">{container.type_name}</td>
              <td className="px-6 py-4">
                <ContainerStatusBadge status={container.status} />
              </td>
              <td className="px-6 py-4 text-slate-700">{container.customer_name ?? '—'}</td>
              <td className="px-6 py-4 text-slate-600">
                {new Date(container.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                {container.status === 'available' && (
                  <button
                    type="button"
                    onClick={() => onRetire(container)}
                    className="text-sm font-medium text-slate-600 hover:text-red-600"
                  >
                    Retire
                  </button>
                )}
                {container.status === 'retired' && (
                  <button
                    type="button"
                    onClick={() => onRestore(container)}
                    className="text-sm font-medium text-brand-600 hover:text-brand-800"
                  >
                    Restore
                  </button>
                )}
                {container.status === 'with_customer' && (
                  <span className="text-slate-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}