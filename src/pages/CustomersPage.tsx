import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { CustomersTable } from '../features/customers/CustomersTable'
import { RegisterCustomerModal } from '../features/customers/RegisterCustomerModal'
import { useCustomers } from '../features/customers/useCustomers'

export function CustomersPage() {
  const { customers, isLoading, errorMessage, reload } = useCustomers()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const query = search.trim().toLowerCase()
  const visibleCustomers = query
    ? customers.filter(
        (customer) =>
          customer.full_name.toLowerCase().includes(query) ||
          (customer.phone ?? '').toLowerCase().includes(query),
      )
    : customers

  return (
    <>
      <PageHeader
        title="Customers"
        description="Registered customers and the containers they currently hold."
        action={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus size={16} />
            Register New Customer
          </button>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or phone"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </div>

        {isLoading && (
          <p className="px-6 py-12 text-center text-sm text-slate-500">Loading customers…</p>
        )}

        {!isLoading && errorMessage && (
          <p className="px-6 py-12 text-center text-sm text-red-600">
            Could not load customers: {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && <CustomersTable customers={visibleCustomers} />}
      </div>

      {isModalOpen && (
        <RegisterCustomerModal onClose={() => setIsModalOpen(false)} onCreated={reload} />
      )}
    </>
  )
}