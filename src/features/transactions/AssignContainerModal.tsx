import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '../../components/Modal'
import { notifyDataChanged } from '../../lib/dataRefresh'
import { getErrorMessage } from '../../lib/errors'
import { assignContainers } from '../../services/transactions'
import type { ContainerType } from '../../types/models'
import {
  buildContainerIndex,
  resolveContainers,
  type ContainerResolution,
} from '../containers/containerLookup'
import {
  describeContainers,
  emptySuffixInput,
  parseSuffixInput,
  summarizeList,
  type SuffixInputState,
  type SuffixResult,
} from '../containers/containerNumbers'
import { SuffixInput } from '../containers/SuffixInput'
import { useContainers } from '../containers/useContainers'
import { useContainerTypes } from '../containers/useContainerTypes'
import { CustomerPicker } from '../customers/CustomerPicker'
import { useCustomers } from '../customers/useCustomers'

type AssignContainerModalProps = {
  onClose: () => void
}

// One group of containers: a type plus which of its containers (a range or a list)
type Line = {
  id: number
  // Empty means "the first active type"
  typeId: string
  input: SuffixInputState
}

// A line together with what its typed numbers turned out to mean
type LineEvaluation = {
  line: Line
  type: ContainerType | undefined
  parsed: SuffixResult
  resolution: ContainerResolution | null
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200'

function newLine(id: number, typeId: string): Line {
  return { id, typeId, input: emptySuffixInput }
}

function describeUnavailable(resolution: ContainerResolution): string[] {
  return resolution.unavailable.map(
    (container) =>
      `${container.container_number} (${
        container.status === 'with_customer'
          ? `with ${container.customer_name ?? 'a customer'}`
          : 'retired'
      })`,
  )
}

export function AssignContainerModal({ onClose }: AssignContainerModalProps) {
  const customersState = useCustomers()
  const containersState = useContainers()
  const typesState = useContainerTypes()

  const [customerId, setCustomerId] = useState<string | null>(null)
  const [lines, setLines] = useState<Line[]>([newLine(1, '')])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Counts up whenever the cursor should jump to the first field
  const [focusTick, setFocusTick] = useState(0)
  const nextLineId = useRef(2)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusTick > 0) firstInputRef.current?.focus()
  }, [focusTick])

  const isLoading = customersState.isLoading || containersState.isLoading || typesState.isLoading
  const loadError =
    customersState.errorMessage || containersState.errorMessage || typesState.errorMessage

  const activeCustomers = customersState.customers.filter((customer) => customer.is_active)
  const customer = customersState.customers.find((item) => item.id === customerId) ?? null
  const activeTypes = typesState.containerTypes.filter((containerType) => containerType.is_active)

  function availableCount(typeToCount: string) {
    return containersState.containers.filter(
      (container) => container.container_type_id === typeToCount && container.status === 'available',
    ).length
  }

  // Work out what each group of typed numbers means, using the real containers
  function evaluate(line: Line): LineEvaluation {
    const type = activeTypes.find((containerType) => containerType.id === line.typeId) ?? activeTypes[0]
    const parsed = parseSuffixInput(line.input)
    const resolution =
      type && parsed.status === 'ok'
        ? resolveContainers(
            buildContainerIndex(containersState.containers, type),
            type.identifier_key,
            parsed.suffixes,
          )
        : null

    return { line, type, parsed, resolution }
  }

  const evaluations = lines.map(evaluate)

  const hasProblems = evaluations.some(
    ({ parsed, resolution }) =>
      parsed.status === 'error' ||
      (resolution !== null && (resolution.missing.length > 0 || resolution.unavailable.length > 0)),
  )

  // Every container to assign, across all groups (a container in two groups counts once)
  const assignIds = [
    ...new Set(
      evaluations.flatMap(({ resolution }) =>
        resolution ? resolution.available.map((container) => container.id) : [],
      ),
    ),
  ]

  const canAssign = customer !== null && !hasProblems && assignIds.length > 0

  const previewLines = evaluations.flatMap(({ line, type, resolution }) =>
    type && resolution && resolution.available.length > 0
      ? [
          {
            id: line.id,
            name: type.name,
            label: describeContainers(
              line.input.mode,
              resolution.available.map((container) => container.container_number),
            ),
          },
        ]
      : [],
  )

  function clearMessages() {
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleSelectCustomer(picked: { id: string } | null) {
    setCustomerId(picked?.id ?? null)
    clearMessages()
    setFocusTick((tick) => tick + 1)
  }

  function updateLine(id: number, changes: Partial<Line>) {
    setLines(lines.map((line) => (line.id === id ? { ...line, ...changes } : line)))
    clearMessages()
  }

  function removeLine(id: number) {
    setLines(lines.filter((line) => line.id !== id))
    clearMessages()
  }

  function handleAddLine() {
    // Suggest a type that isn't used by another group yet
    const usedTypeIds = new Set(evaluations.map(({ type }) => type?.id))
    const freeType = activeTypes.find((containerType) => !usedTypeIds.has(containerType.id))

    setLines([...lines, newLine(nextLineId.current++, freeType?.id ?? '')])
    clearMessages()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearMessages()

    if (!customer || !canAssign) return

    setIsSubmitting(true)

    try {
      const count = await assignContainers(assignIds, customer.id)
      setSuccessMessage(
        `Assigned ${count} ${count === 1 ? 'container' : 'containers'} to ${customer.full_name}. You can assign more or close.`,
      )
      setLines([newLine(1, '')])
      setFocusTick((tick) => tick + 1)
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
      title="Assign Containers"
      description="Give containers to a customer, from one or more container types"
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
              onSelect={handleSelectCustomer}
            />
          </div>

          {customer && activeTypes.length === 0 && (
            <p className="text-sm text-amber-700">
              There are no active container types. Add one on the Containers page first.
            </p>
          )}

          {customer && activeTypes.length > 0 && (
            <>
              <div className="space-y-3">
                {evaluations.map(({ line, type, parsed, resolution }, position) => (
                  <div key={line.id} className="space-y-3 rounded-lg border border-slate-200 p-4">
                    <div className="flex items-end gap-3">
                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor={`assign-type-${line.id}`}
                          className="mb-1 block text-sm font-medium text-slate-700"
                        >
                          Container type
                        </label>
                        <select
                          id={`assign-type-${line.id}`}
                          value={type?.id ?? ''}
                          onChange={(event) => updateLine(line.id, { typeId: event.target.value })}
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

                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          aria-label="Remove this container type"
                          className="rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {type && (
                      <SuffixInput
                        idPrefix={`assign-${line.id}`}
                        identifierKey={type.identifier_key}
                        value={line.input}
                        onChange={(input) => updateLine(line.id, { input })}
                        inputRef={position === 0 ? firstInputRef : undefined}
                      />
                    )}

                    {parsed.status === 'error' && (
                      <p className="text-sm text-amber-700">{parsed.message}</p>
                    )}

                    {resolution && resolution.missing.length > 0 && (
                      <p className="text-sm text-amber-700">
                        No container found for: {summarizeList(resolution.missing)}.
                      </p>
                    )}

                    {resolution && resolution.unavailable.length > 0 && (
                      <p className="text-sm text-amber-700">
                        Not available: {summarizeList(describeUnavailable(resolution))}.
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-800"
              >
                <Plus size={16} />
                Add another container type
              </button>

              {canAssign && (
                <div className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
                  <p>
                    Will assign{' '}
                    <span className="font-semibold">
                      {assignIds.length} {assignIds.length === 1 ? 'container' : 'containers'}
                    </span>{' '}
                    to {customer.full_name}:
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {previewLines.map((previewLine) => (
                      <li key={previewLine.id}>
                        <span className="font-medium">{previewLine.name}</span>:{' '}
                        <span className="font-mono font-semibold">{previewLine.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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