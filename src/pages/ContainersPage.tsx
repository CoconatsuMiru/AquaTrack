import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { AddContainerModal } from '../features/containers/AddContainerModal'
import { ContainersTable } from '../features/containers/ContainersTable'
import { ContainerTypeCards } from '../features/containers/ContainerTypeCards'
import { ContainerTypeModal } from '../features/containers/ContainerTypeModal'
import { useContainers } from '../features/containers/useContainers'
import { useContainerTypes } from '../features/containers/useContainerTypes'
import { getErrorMessage } from '../lib/errors'
import {
  restoreContainer,
  retireContainer,
  type ContainerWithDetails,
} from '../services/containers'
import type { ContainerStatus, ContainerType } from '../types/models'

export function ContainersPage() {
  const typesState = useContainerTypes()
  const containersState = useContainers()

  // 'new' = adding a type, a ContainerType = editing it, null = closed
  const [typeModal, setTypeModal] = useState<ContainerType | 'new' | null>(null)
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ContainerStatus>('all')
  const [actionError, setActionError] = useState('')

  const isLoading = typesState.isLoading || containersState.isLoading
  const errorMessage = typesState.errorMessage || containersState.errorMessage

  const activeTypes = typesState.containerTypes.filter((containerType) => containerType.is_active)

  const query = search.trim().toLowerCase()
  const visibleContainers = containersState.containers.filter((container) => {
    const matchesStatus = statusFilter === 'all' || container.status === statusFilter
    const matchesSearch =
      !query ||
      container.container_number.toLowerCase().includes(query) ||
      (container.customer_name ?? '').toLowerCase().includes(query)
    return matchesStatus && matchesSearch
  })

  // A type's name appears in the table, so both lists reload after a type changes
  function handleTypeSaved() {
    typesState.reload()
    containersState.reload()
  }

  async function runContainerAction(action: () => Promise<void>) {
    setActionError('')
    try {
      await action()
      containersState.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  function handleRetire(container: ContainerWithDetails) {
    const confirmed = window.confirm(
      `Retire container ${container.container_number}? It will no longer be available to assign.`,
    )
    if (confirmed) {
      runContainerAction(() => retireContainer(container.id))
    }
  }

  function handleRestore(container: ContainerWithDetails) {
    runContainerAction(() => restoreContainer(container.id))
  }

  return (
    <>
      <PageHeader
        title="Containers"
        description="Every physical container, its type, and where it is right now."
        action={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTypeModal('new')}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <Plus size={16} />
              Add Container Type
            </button>
            <button
              type="button"
              onClick={() => setIsContainerModalOpen(true)}
              disabled={activeTypes.length === 0}
              title={activeTypes.length === 0 ? 'Add a container type first' : undefined}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              Add Container
            </button>
          </div>
        }
      />

      {isLoading && <p className="py-12 text-center text-sm text-slate-500">Loading containers…</p>}

      {!isLoading && errorMessage && (
        <p className="py-12 text-center text-sm text-red-600">
          Could not load containers: {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && (
        <div className="space-y-6">
          <ContainerTypeCards
            containerTypes={typesState.containerTypes}
            containers={containersState.containers}
            onEdit={setTypeModal}
          />

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap gap-3 border-b border-slate-200 p-4">
              <div className="relative w-full max-w-sm">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by container number or customer"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | ContainerStatus)}
                aria-label="Filter by status"
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              >
                <option value="all">All statuses</option>
                <option value="available">Available</option>
                <option value="with_customer">With customer</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            {actionError && (
              <p className="border-b border-slate-200 bg-red-50 px-6 py-3 text-sm text-red-700">
                {actionError}
              </p>
            )}

            <ContainersTable
              containers={visibleContainers}
              onRetire={handleRetire}
              onRestore={handleRestore}
            />
          </div>
        </div>
      )}

      {typeModal && (
        <ContainerTypeModal
          containerType={typeModal === 'new' ? undefined : typeModal}
          onClose={() => setTypeModal(null)}
          onSaved={handleTypeSaved}
        />
      )}

      {isContainerModalOpen && (
        <AddContainerModal
          containerTypes={activeTypes}
          onClose={() => setIsContainerModalOpen(false)}
          onCreated={containersState.reload}
        />
      )}
    </>
  )
}