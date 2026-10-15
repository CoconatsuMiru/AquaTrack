import { useRef, useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { getErrorMessage } from '../../lib/errors'
import { createContainers } from '../../services/containers'
import type { ContainerType } from '../../types/models'
import {
  buildContainerNumbers,
  describeContainers,
  emptySuffixInput,
  parseSuffixInput,
  type SuffixInputState,
} from './containerNumbers'
import { SuffixInput } from './SuffixInput'

type AddContainerModalProps = {
  // Only active types should be passed in
  containerTypes: ContainerType[]
  // Every container number that already exists
  existingNumbers: string[]
  onClose: () => void
  onCreated: () => void
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200'

export function AddContainerModal({
  containerTypes,
  existingNumbers,
  onClose,
  onCreated,
}: AddContainerModalProps) {
  const [typeId, setTypeId] = useState(containerTypes[0]?.id ?? '')
  const [input, setInput] = useState<SuffixInputState>(emptySuffixInput)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  const selectedType = containerTypes.find((containerType) => containerType.id === typeId)
  const existing = new Set(existingNumbers)

  // What would be created with what has been typed so far
  const parsed = parseSuffixInput(input)

  let plan: { all: string[]; missing: string[] } | null = null
  if (selectedType && parsed.status === 'ok') {
    const all = buildContainerNumbers(selectedType.identifier_key, parsed.suffixes)
    plan = { all, missing: all.filter((number) => !existing.has(number)) }
  }

  function handleTypeChange(newTypeId: string) {
    setTypeId(newTypeId)
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleInputChange(next: SuffixInputState) {
    setInput(next)
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!selectedType) return

    if (parsed.status === 'empty') {
      setErrorMessage('Enter the containers to add.')
      return
    }

    if (parsed.status === 'error') {
      setErrorMessage(parsed.message)
      return
    }

    const all = buildContainerNumbers(selectedType.identifier_key, parsed.suffixes)
    const missing = all.filter((number) => !existing.has(number))

    if (missing.length === 0) {
      setErrorMessage('All of those containers already exist.')
      return
    }

    setIsSubmitting(true)

    try {
      await createContainers(
        missing.map((containerNumber) => ({
          container_number: containerNumber,
          container_type_id: selectedType.id,
        })),
      )
      onCreated()

      const skipped = all.length - missing.length
      setSuccessMessage(
        `Added ${missing.length} ${missing.length === 1 ? 'container' : 'containers'}` +
          (skipped > 0 ? ` (${skipped} already existed and were skipped)` : '') +
          '. You can add more.',
      )

      // Stay open and get ready for the next batch (keeping the chosen mode)
      setInput({ ...emptySuffixInput, mode: input.mode })
      firstInputRef.current?.focus()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const span = plan ? describeContainers(input.mode, plan.all) : ''
  const skippedCount = plan ? plan.all.length - plan.missing.length : 0

  return (
    <Modal
      title="Add Containers"
      description="Register one container or a whole batch at once"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="container-type" className="mb-1 block text-sm font-medium text-slate-700">
            Container type <span className="text-red-600">*</span>
          </label>
          <select
            id="container-type"
            value={typeId}
            onChange={(event) => handleTypeChange(event.target.value)}
            required
            className={inputClass}
          >
            {containerTypes.map((containerType) => (
              <option key={containerType.id} value={containerType.id}>
                {containerType.name} ({containerType.identifier_key})
              </option>
            ))}
          </select>
        </div>

        {selectedType && (
          <SuffixInput
            idPrefix="add-container"
            identifierKey={selectedType.identifier_key}
            value={input}
            onChange={handleInputChange}
            inputRef={firstInputRef}
          />
        )}

        {parsed.status === 'error' && <p className="text-sm text-amber-700">{parsed.message}</p>}

        {plan && plan.missing.length > 0 && (
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
            Will create{' '}
            <span className="font-semibold">
              {plan.missing.length} {plan.missing.length === 1 ? 'container' : 'containers'}
            </span>
            : <span className="font-mono font-semibold">{span}</span>
            {skippedCount > 0 && ` (${skippedCount} already exist and will be skipped)`}
          </p>
        )}

        {plan && plan.missing.length === 0 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <span className="font-mono font-semibold">{span}</span>{' '}
            {plan.all.length === 1 ? 'already exists.' : 'already exist.'}
          </p>
        )}

        {successMessage && <p className="text-sm text-emerald-700">{successMessage}</p>}
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Add containers'}
          </button>
        </div>
      </form>
    </Modal>
  )
}