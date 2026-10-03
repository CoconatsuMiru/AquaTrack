import { useState } from 'react'
import { Search } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { TodaySummaryCards } from '../features/transactions/TodaySummaryCards'
import { TransactionsTable } from '../features/transactions/TransactionsTable'
import { useTodayCounts, useTransactions } from '../features/transactions/useTransactions'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { TRANSACTIONS_PAGE_SIZE, type TransactionPeriod } from '../services/transactions'
import type { TransactionType } from '../types/models'

type TypeFilter = 'all' | TransactionType

const typeTabs: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'assign', label: 'Assignments' },
  { value: 'return', label: 'Returns' },
]

const periodOptions: { value: TransactionPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
]

export function TransactionsPage() {
  const [type, setType] = useState<TypeFilter>('all')
  const [period, setPeriod] = useState<TransactionPeriod>('today')
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)

  // Wait until the user pauses typing before asking the database
  const search = useDebouncedValue(searchText, 300)

  const { rows, total, isLoading, errorMessage } = useTransactions({ type, period, search, page })
  const todayState = useTodayCounts()

  const totalPages = Math.max(1, Math.ceil(total / TRANSACTIONS_PAGE_SIZE))
  const firstShown = total === 0 ? 0 : (page - 1) * TRANSACTIONS_PAGE_SIZE + 1
  const lastShown = Math.min(page * TRANSACTIONS_PAGE_SIZE, total)

  // Any change to a filter starts again from the first page
  function handleTypeChange(newType: TypeFilter) {
    setType(newType)
    setPage(1)
  }

  function handlePeriodChange(newPeriod: TransactionPeriod) {
    setPeriod(newPeriod)
    setPage(1)
  }

  function handleSearchChange(text: string) {
    setSearchText(text)
    setPage(1)
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        description="The full history of container assignments and returns."
      />

      <div className="space-y-6">
        <TodaySummaryCards counts={todayState.counts} isLoading={todayState.isLoading} />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
            <div className="flex gap-2">
              {typeTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleTypeChange(tab.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    type === tab.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <select
              value={period}
              onChange={(event) => handlePeriodChange(event.target.value as TransactionPeriod)}
              aria-label="Time period"
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="relative ml-auto w-full max-w-xs">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchText}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search customer, phone, container or #"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>

          {errorMessage ? (
            <p className="px-6 py-12 text-center text-sm text-red-600">
              Could not load transactions: {errorMessage}
            </p>
          ) : isLoading ? (
            <p className="px-6 py-12 text-center text-sm text-slate-500">Loading transactions…</p>
          ) : (
            <TransactionsTable rows={rows} />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-3 text-sm text-slate-600">
            <p>
              {total === 0
                ? 'No records'
                : `Showing ${firstShown}–${lastShown} of ${total} records`}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}