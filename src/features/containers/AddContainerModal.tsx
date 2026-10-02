import { useRef, useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { getErrorMessage } from '../../lib/errors'
import { createContainer } from '../../services/containers'
import type { ContainerType } from '../../types/models'

type AddContainerModalProps = {
  // Only active types should be passed in
  containerTypes: ContainerType[]
  onClose: () => void
  onCreated: () => void
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200'

export function AddContainerModal({ containerTypes, onClose, onCreated }: AddContainerModalProps) {
  const [containerNumber, setContainerNumber] = useState('')
  const [typeId, setTypeId] = useState(containerTypes[0]?.id ?? '')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const numberInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    const number = containerNumber.trim()

    try {
      await createContainer({ container_number: number, container_type_id: typeId })
      onCreated()

      // Stay open and get ready for the next container
      setSuccessMessage(`Container ${number} added. You can add another.`)
      setContainerNumber('')
      numberInputRef.current?.focus()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title="Add Container"
      description="Register a physical container with its unique number"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="container-number"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Container number / barcode <span className="text-red-600">*</span>
          </label>
          <input
            id="container-number"
            ref={numberInputRef}
            type="text"
            value={containerNumber}
            onChange={(event) => setContainerNumber(event.target.value)}
            placeholder="e.g. 5G-0001"
            required
            autoFocus
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            The number or barcode printed on the container. It must be unique.
          </p>
        </div>

        <div>
          <label htmlFor="container-type" className="mb-1 block text-sm font-medium text-slate-700">
            Container type <span className="text-red-600">*</span>
          </label>
          <select
            id="container-type"
            value={typeId}
            onChange={(event) => setTypeId(event.target.value)}
            required
            className={inputClass}
          >
            {containerTypes.map((containerType) => (
              <option key={containerType.id} value={containerType.id}>
                {containerType.name}
              </option>
            ))}
          </select>
        </div>

        {successMessage && <p className="text-sm text-emerald-700">{successMessage}</p>}
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Add container'}
          </button>
        </div>
      </form>
    </Modal>
  )
}