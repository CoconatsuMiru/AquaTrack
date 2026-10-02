import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { getErrorMessage } from '../../lib/errors'
import { createCustomer } from '../../services/customers'

type RegisterCustomerModalProps = {
  onClose: () => void
  onCreated: () => void
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200'

export function RegisterCustomerModal({ onClose, onCreated }: RegisterCustomerModalProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await createCustomer({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
      })
      onCreated()
      onClose()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title="Register New Customer"
      description="Create a customer account"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="full-name" className="mb-1 block text-sm font-medium text-slate-700">
            Full name <span className="text-red-600">*</span>
          </label>
          <input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="e.g. Maria Santos"
            required
            autoFocus
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
            Mobile phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="e.g. 0917 123 4567"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">
            Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Street, barangay, city"
            className={inputClass}
          />
        </div>

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Create customer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}