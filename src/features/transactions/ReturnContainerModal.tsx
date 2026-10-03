import { useState } from 'react'
import { ConfirmModal } from '../../components/ConfirmModal'
import { Modal } from '../../components/Modal'
import { notifyDataChanged } from '../../lib/dataRefresh'
import { getErrorMessage } from '../../lib/errors'
import type { ContainerWithDetails } from '../../services/containers'
import { returnContainers } from '../../services/transactions'
import { useContainers } from '../containers/useContainers'
import { CustomerPicker } from '../customers/CustomerPicker'
import { useCustomers } from '../customers/useCustomers'

type ReturnContainerModalProps = {
  onClose: () => void
}

export function ReturnContainerModal({ onClose }: ReturnContainerModalProps) {
  const customersState = useCustomers()
  const containersState = useContainers()

  const [customerId, setCustomerId] = useState<string | null>(null)
  const [isConfirmingAll, setIsConfirmingAll] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isWorking, setIsWorking] = useState(false)

  const isLoading = customersState.isLoading || containersState.isLoading
  const loadError = customersState.errorMessage || containersState.errorMessage

  // Only customers who currently hold containers can be chosen
  const customersWithContainers = customersState.customers.filter(
    (customer) => customer.containers_held > 0,
  )
  const customer = customersState.customers.find((item) => item.id === customerId) ?? null

  const heldContainers = customer
    ? containersState.containers.filter(
        (container) =>
          container.status === 'with_customer' && container.current_customer_id === customer.id,
      )
    : []

  // Returns the given containers together. Throws if it fails.
  async function performReturn(toReturn: ContainerWithDetails[]) {
    try {
      const count = await returnContainers(toReturn.map((container) => container.id))
      setSuccessMessage(
        count === 1 ? `Returned ${toReturn[0].container_number}.` : `Returned ${count} containers.`,
      )
    } finally {
      // Refresh every list, whether it worked or not, so nothing shows stale data
      notifyDataChanged()
    }
  }

  async function handleReturnOne(container: ContainerWithDetails) {
    setErrorMessage('')
    setSuccessMessage('')
    setIsWorking(true)

    try {
      await performReturn([container])
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsWorking(false)
    }
  }

  function handleSelectCustomer(picked: { id: string } | null) {
    setCustomerId(picked?.id ?? null)
    setErrorMessage('')
    setSuccessMessage('')
  }

  return (
    <>
      <Modal
        title="Record Return"
        description="Find the customer, then return their containers"
        onClose={onClose}
      >
        {isLoading && <p className="py-6 text-center text-sm text-slate-500">Loading…</p>}

        {!isLoading && loadError && (
          <p className="py-6 text-center text-sm text-red-600">Could not load data: {loadError}</p>
        )}

        {!isLoading && !loadError && (
          <div className="space-y-4">
            <div>
              <p className="mb-1 block text-sm font-medium text-slate-700">Customer</p>

              {customersWithContainers.length === 0 && !customer ? (
                <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No customers are currently holding containers.
                </p>
              ) : (
                <CustomerPicker
                  customers={customersWithContainers}
                  selected={customer}
                  onSelect={handleSelectCustomer}
                />
              )}
            </div>

            {customer && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">
                    Containers held ({heldContainers.length})
                  </p>
                  {heldContainers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('')
                        setSuccessMessage('')
                        setIsConfirmingAll(true)
                      }}
                      disabled={isWorking}
                      className="text-sm font-medium text-brand-600 hover:text-brand-800 disabled:opacity-50"
                    >
                      Return all
                    </button>
                  )}
                </div>

                {heldContainers.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    This customer has no containers out.
                  </p>
                ) : (
                  <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                    {heldContainers.map((container) => (
                      <li key={container.id} className="flex items-center justify-between px-4 py-2.5">
                        <div>
                          <p className="font-mono text-sm font-medium text-slate-900">
                            {container.container_number}
                          </p>
                          <p className="text-xs text-slate-500">{container.type_name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleReturnOne(container)}
                          disabled={isWorking}
                          className="rounded-lg bg-brand-100 px-3 py-1.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-200 disabled:opacity-50"
                        >
                          Return
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {successMessage && <p className="text-sm text-emerald-700">{successMessage}</p>}
            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          </div>
        )}
      </Modal>

      {isConfirmingAll && customer && (
        <ConfirmModal
          title="Return all containers"
          message={
            <>
              Return all <span className="font-semibold">{heldContainers.length}</span> containers
              held by <span className="font-semibold">{customer.full_name}</span>?
            </>
          }
          confirmLabel="Return all"
          onConfirm={() => performReturn(heldContainers)}
          onClose={() => setIsConfirmingAll(false)}
        />
      )}
    </>
  )
}