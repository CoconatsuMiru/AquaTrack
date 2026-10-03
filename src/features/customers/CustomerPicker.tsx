import { useState } from 'react'
import { Search } from 'lucide-react'
import type { CustomerWithHeldCount } from '../../services/customers'

type CustomerPickerProps = {
  customers: CustomerWithHeldCount[]
  selected: CustomerWithHeldCount | null
  onSelect: (customer: CustomerWithHeldCount | null) => void
}

const MAX_RESULTS = 5

export function CustomerPicker({ customers, selected, onSelect }: CustomerPickerProps) {
  const [search, setSearch] = useState('')

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
        <div>
          <p className="font-medium text-slate-900">{selected.full_name}</p>
          <p className="text-xs text-slate-600">
            {selected.phone ?? 'No phone'} · Holding {selected.containers_held}{' '}
            {selected.containers_held === 1 ? 'container' : 'containers'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-sm font-medium text-brand-600 hover:text-brand-800"
        >
          Change
        </button>
      </div>
    )
  }

  const query = search.trim().toLowerCase()
  const results = query
    ? customers
        .filter(
          (customer) =>
            customer.full_name.toLowerCase().includes(query) ||
            (customer.phone ?? '').toLowerCase().includes(query),
        )
        .slice(0, MAX_RESULTS)
    : []

  return (
    <div>
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or phone"
          autoFocus
          className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      </div>

      {query && results.length === 0 && (
        <p className="mt-2 text-sm text-slate-500">No matching customers.</p>
      )}

      {results.length > 0 && (
        <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
          {results.map((customer) => (
            <li key={customer.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(customer)
                  setSearch('')
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-slate-900">{customer.full_name}</span>
                <span className="text-xs text-slate-500">{customer.phone ?? 'No phone'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}