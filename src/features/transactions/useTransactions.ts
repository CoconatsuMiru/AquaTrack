import { useCallback } from 'react'
import { useAsyncData } from '../../hooks/useAsyncData'
import {
  getTodayCounts,
  listTransactions,
  type TodayCounts,
  type TransactionFilters,
  type TransactionsResult,
} from '../../services/transactions'

const emptyResult: TransactionsResult = { rows: [], total: 0 }
const noCounts: TodayCounts = { assigned: 0, returned: 0 }

// Loads one page of history. It reloads by itself whenever a filter or the page changes.
export function useTransactions(filters: TransactionFilters) {
  const { type, period, search, page } = filters

  const fetchPage = useCallback(
    () => listTransactions({ type, period, search, page }),
    [type, period, search, page],
  )

  const { data, isLoading, errorMessage } = useAsyncData(fetchPage, emptyResult)

  return { rows: data.rows, total: data.total, isLoading, errorMessage }
}

export function useTodayCounts() {
  const { data, isLoading } = useAsyncData(getTodayCounts, noCounts)
  return { counts: data, isLoading }
}