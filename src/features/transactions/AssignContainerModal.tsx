import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { notifyDataChanged } from '../../lib/dataRefresh'
import { getErrorMessage } from '../../lib/errors'
import { assignContainers } from '../../services/transactions'
import { buildContainerIndex, resolveContainers } from '../containers/containerLookup'
import {
  formatContainerNumber,
  parseNumberList,
  parseNumberRange,
  rangeToNumbers,
} from '../containers/containerNumbers'
import { useContainers } from '../containers/useContainers'
import { useContainerTypes } from '../containers/useContainerTypes'
import { CustomerPicker } from '../customers/CustomerPicker'
import { useCustomers } from '../customers/useCustomers'

type AssignContainerModalProps = {
  onClose: () => void
}

type Mode = 'range' | 'list'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200'

const prefixClass = 'rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm font-semibold text-slate-700'

// Shows at most `limit` items so a long list doesn't flood the modal
function summarize(items: string[], limit = 10) {
  if (items.length <= limit) return items.join(', ')
  return `${items.slice(0, limit).join(', ')} … and ${items.length - limit} more`
}

export function AssignContainerModal({ onClose }: AssignContainerModalProps) {
  const customersState = useCustomers()
  const containersState = useContainers()
  const typesState = useContainerTypes()

  const [customerId, setCustomerId] = useState<string | null>(null)
  const [typeId, setTypeId] = useState('')
  const [mode, setMode] = useState<Mode>('range')
  const [minText, setMinText] = useState('')
  const [maxText, setMaxText] = useState('')
  const [listText, setListText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstNumberInputRef = useRef<HTMLInputElement>(null)

  const isLoading = customersState.isLoading || containersState.isLoading || typesState.isLoading
  const loadError =
    customersState.errorMessage || containersState.errorMessage || typesState.errorMessage

  const activeCustomers = customersState.customers.filter((customer) => customer.is_active)
  const customer = customersState.customers.find((item) => item.id === customerId) ?? null

  const activeTypes = typesState.containerTypes.filter((containerType) => containerType.is_active)
  const selectedType = activeTypes.find((containerType) => containerType.id === typeId) ?? activeTypes[0]

  // Move the cursor to the number field as soon as a customer is chosen
  useEffect(() => {
    if (customerId) firstNumberInputRef.current?.focus()
  }, [customerId])

  function availableCount(typeToCount: string) {
    return containersState.containers.filter(
      (container) => container.container_type_id === typeToCount && container.status === 'available',
    ).length
  }

  // Work out which numbers were typed
  let numbers: number[] = []
  let inputError = ''

  if (mode === 'range') {
    if (minText !== '') {
      const result = parseNumberRange(minText, maxText)
      if (result.ok) numbers = rangeToNumbers(result.range)
      else inputError = result.message
    }
  } else if (listText.trim() !== '') {
    const result = parseNumberList(listText)
    if (result.ok) numbers = result.numbers
    else inputError = result.message
  }

  // Then check each number against the real containers of the chosen type
  const index = selectedType ? buildContainerIndex(containersState.containers, selectedType) : null
  const resolution = index && numbers.length > 0 ? resolveContainers(index, numbers) : null

  const missingLabels =
    selectedType && index && resolution
      ? resolution.missing.map((number) =>
          formatContainerNumber(selectedType.identifier_key, number, index.width),
        )
      : []

  const unavailableLabels = resolution
    ? resolution.unavailable.map(
        (container) =>
          `${container.container_number} (${
            container.status === 'with_customer'
              ? `with ${container.customer_name ?? 'a customer'}`
              : 'retired'
          })`,
      )
    : []

  const canAssign =
    customer !== null &&
    resolution !== null &&
    resolution.available.length > 0 &&
    resolution.missing.length === 0 &&
    resolution.unavailable.length === 0

  const availableNumbers = resolution?.available.map((container) => container.container_number) ?? []
  const previewLabel =
    mode === 'range' && availableNumbers.length > 1
      ? `${availableNumbers[0]} to ${availableNumbers[availableNumbers.length - 1]}`
      : summarize(availableNumbers)

  function handleTypeChange(newTypeId: string) {
    setTypeId(newTypeId)
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleModeChange(newMode: Mode) {
    setMode(newMode)
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!customer || !resolution || !canAssign) return

    setIsSubmitting(true)

    try {
      const count = await assignContainers(
        resolution.available.map((container) => container.id),
        customer.id,
      )
      setSuccessMessage(
        `Assigned ${count} ${count === 1 ? 'container' : 'containers'} to ${customer.full_name}. You can assign more or close.`,
      )
      setMinText('')
      setMaxText('')
      setListText('')
      firstNumberInputRef.current?.focus()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      // Refresh every list, whether it worked or not, so nothing shows stale data
      notifyDataChanged()
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title="Assign Container"
      description="Give available containers to a customer"
      onClose={onClose}
    >
      {isLoading && <p className="py-6 text-center text-sm text-slate-500">Loading…</p>}

      {!isLoading && loadError && (
        <p className="py-6 text-center text-sm text-red-600">Could not load data: {loadError}</p>
      )}

      {!isLoading && !loadError && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="mb-1 block text-sm font-medium text-slate-700">
              Customer <span className="text-red-600">*</span>
            </p>
            <CustomerPicker
              customers={activeCustomers}
              selected={customer}
              onSelect={(picked) => setCustomerId(picked?.id ?? null)}
            />
          </div>

          {customer && !selectedType && (
            <p className="text-sm text-amber-700">
              There are no active container types. Add one on the Containers page first.
            </p>
          )}

          {customer && selectedType && (
            <>
              <div>
                <label
                  htmlFor="assign-container-type"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Container type <span className="text-red-600">*</span>
                </label>
                <select
                  id="assign-container-type"
                  value={selectedType.id}
                  onChange={(event) => handleTypeChange(event.target.value)}
                  className={inputClass}
                >
                  {activeTypes.map((containerType) => (
                    <option key={containerType.id} value={containerType.id}>
                      {containerType.name} ({containerType.identifier_key}) ·{' '}
                      {availableCount(containerType.id)} available
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1 block text-sm font-medium text-slate-700">
                  Which containers? <span className="text-red-600">*</span>
                </p>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => handleModeChange('range')}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      mode === 'range'
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Number range
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('list')}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      mode === 'list'
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Specific numbers
                  </button>
                </div>
              </div>

              {mode === 'range' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="assign-min"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Min number
                      </label>
                      <div className="flex items-center gap-2">
                        <span className={prefixClass}>{selectedType.identifier_key}-</span>
                        <input
                          id="assign-min"
                          ref={firstNumberInputRef}
                          type="text"
                          inputMode="numeric"
                          value={minText}
                          onChange={(event) => setMinText(event.target.value.replace(/\D/g, ''))}
                          placeholder="01"
                          maxLength={6}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="assign-max"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Max number
                      </label>
                      <div className="flex items-center gap-2">
                        <span className={prefixClass}>{selectedType.identifier_key}-</span>
                        <input
                          id="assign-max"
                          type="text"
                          inputMode="numeric"
                          value={maxText}
                          onChange={(event) => setMaxText(event.target.value.replace(/\D/g, ''))}
                          placeholder="19"
                          maxLength={6}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Every number from the min to the max is assigned, for example 01 and 19. Leave
                    the max empty for a single container.
                  </p>
                </div>
              )}

              {mode === 'list' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={prefixClass}>{selectedType.identifier_key}-</span>
                    <input
                      id="assign-list"
                      ref={firstNumberInputRef}
                      type="text"
                      value={listText}
                      onChange={(event) => setListText(event.target.value)}
                      placeholder="01, 02, 09, 20"
                      aria-label="Container numbers separated by commas"
                      autoComplete="off"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Separate the numbers with commas, for example 01, 02, 09, 20.
                  </p>
                </div>
              )}

              {inputError && <p className="text-sm text-amber-700">{inputError}</p>}

              {missingLabels.length > 0 && (
                <p className="text-sm text-amber-700">
                  No container found for: {summarize(missingLabels)}.
                </p>
              )}

              {unavailableLabels.length > 0 && (
                <p className="text-sm text-amber-700">
                  Not available: {summarize(unavailableLabels)}.
                </p>
              )}

              {canAssign && resolution && (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
                  Will assign{' '}
                  <span className="font-semibold">
                    {resolution.available.length}{' '}
                    {resolution.available.length === 1 ? 'container' : 'containers'}
                  </span>{' '}
                  to {customer.full_name}:{' '}
                  <span className="font-mono font-semibold">{previewLabel}</span>
                </p>
              )}
            </>
          )}

          {successMessage && <p className="text-sm text-emerald-700">{successMessage}</p>}
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!canAssign || isSubmitting}
              className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Assigning…' : 'Assign containers'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}