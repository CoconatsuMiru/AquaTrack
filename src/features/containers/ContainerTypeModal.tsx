import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { getErrorMessage } from '../../lib/errors'
import { createContainerType, updateContainerType } from '../../services/containerTypes'
import type { ContainerType } from '../../types/models'

type ContainerTypeModalProps = {
  // Pass an existing type to edit it; leave out to add a new one
  containerType?: ContainerType
  onClose: () => void
  onSaved: () => void
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200'

export function ContainerTypeModal({ containerType, onClose, onSaved }: ContainerTypeModalProps) {
  const isEditing = containerType !== undefined

  const [name, setName] = useState(containerType?.name ?? '')
  const [description, setDescription] = useState(containerType?.description ?? '')
  const [isActive, setIsActive] = useState(containerType?.is_active ?? true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    const values = {
      name: name.trim(),
      description: description.trim() || null,
    }

    try {
      if (containerType) {
        await updateContainerType(containerType.id, { ...values, is_active: isActive })
      } else {
        await createContainerType(values)
      }
      onSaved()
      onClose()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title={isEditing ? 'Edit Container Type' : 'Add Container Type'}
      description="Types group containers that share the same size and kind"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="type-name" className="mb-1 block text-sm font-medium text-slate-700">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="type-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. 5-Gallon Round"
            required
            autoFocus
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="type-description"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <input
            id="type-description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional"
            className={inputClass}
          />
        </div>

        {isEditing && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Active (can be chosen when adding new containers)
          </label>
        )}

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add type'}
          </button>
        </div>
      </form>
    </Modal>
  )
}