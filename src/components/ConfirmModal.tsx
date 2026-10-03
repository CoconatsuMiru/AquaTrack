import { useState, type ReactNode } from 'react'
import { getErrorMessage } from '../lib/errors'
import { Modal } from './Modal'

type ConfirmModalProps = {
  title: string
  message: ReactNode
  confirmLabel: string
  // 'danger' makes the confirm button red (for things like retiring or deleting)
  tone?: 'primary' | 'danger'
  // Runs when the user confirms. If it throws, the error is shown and the modal stays open.
  onConfirm: () => Promise<void> | void
  onClose: () => void
}

const toneClasses = {
  primary: 'bg-brand-600 hover:bg-brand-700',
  danger: 'bg-red-600 hover:bg-red-700',
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  tone = 'primary',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const [isWorking, setIsWorking] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleConfirm() {
    setErrorMessage('')
    setIsWorking(true)

    try {
      await onConfirm()
      onClose()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      setIsWorking(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-sm text-slate-700">{message}</div>

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isWorking}
            className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isWorking}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${toneClasses[tone]}`}
          >
            {isWorking ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}