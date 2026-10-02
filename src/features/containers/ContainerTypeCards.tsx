import { Pencil } from 'lucide-react'
import type { ContainerWithDetails } from '../../services/containers'
import type { ContainerStatus, ContainerType } from '../../types/models'

type ContainerTypeCardsProps = {
  containerTypes: ContainerType[]
  containers: ContainerWithDetails[]
  onEdit: (containerType: ContainerType) => void
}

export function ContainerTypeCards({
  containerTypes,
  containers,
  onEdit,
}: ContainerTypeCardsProps) {
  if (containerTypes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
        No container types yet. Add one to get started.
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {containerTypes.map((containerType) => {
        const ofThisType = containers.filter(
          (container) => container.container_type_id === containerType.id,
        )
        const countWithStatus = (status: ContainerStatus) =>
          ofThisType.filter((container) => container.status === status).length

        return (
          <div
            key={containerType.id}
            className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
              containerType.is_active ? '' : 'opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-900">{containerType.name}</h3>
                {containerType.description && (
                  <p className="mt-0.5 text-xs text-slate-500">{containerType.description}</p>
                )}
                {!containerType.is_active && (
                  <span className="mt-1 inline-block text-xs font-medium text-slate-500">
                    Inactive
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onEdit(containerType)}
                aria-label={`Edit ${containerType.name}`}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Pencil size={16} />
              </button>
            </div>

            <p className="mt-4 text-3xl font-bold text-brand-700">
              {ofThisType.length}
              <span className="ml-1.5 text-sm font-medium text-slate-500">total</span>
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center">
              <div>
                <p className="text-lg font-semibold text-emerald-700">
                  {countWithStatus('available')}
                </p>
                <p className="text-xs text-slate-500">Available</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-brand-700">
                  {countWithStatus('with_customer')}
                </p>
                <p className="text-xs text-slate-500">With customers</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-600">
                  {countWithStatus('retired')}
                </p>
                <p className="text-xs text-slate-500">Retired</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}