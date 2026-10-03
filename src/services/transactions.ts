import { supabase } from '../lib/supabase'
import type { TransactionHistoryRow, TransactionType } from '../types/models'

export const TRANSACTIONS_PAGE_SIZE = 20

export type TransactionPeriod = 'today' | '7d' | '30d' | 'all'

export type TransactionFilters = {
  type: 'all' | TransactionType
  period: TransactionPeriod
  search: string
  // Starts at 1
  page: number
}

export type TransactionsResult = {
  rows: TransactionHistoryRow[]
  // How many transactions match the filters in total (not just on this page)
  total: number
}

export type TodayCounts = {
  assigned: number
  returned: number
}

// Gives several available containers to a customer and records one transaction per container.
// Saved together: either all are assigned, or none are.
export async function assignContainers(
  containerIds: string[],
  customerId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('assign_containers', {
    p_container_ids: containerIds,
    p_customer_id: customerId,
  })

  if (error) throw error

  return data
}

// Takes several containers back from their customers and records one transaction per container.
// Saved together: either all are returned, or none are.
export async function returnContainers(containerIds: string[]): Promise<number> {
  const { data, error } = await supabase.rpc('return_containers', {
    p_container_ids: containerIds,
  })

  if (error) throw error

  return data
}

// The moment a period starts, as a timestamp (null = no limit)
function getPeriodStart(period: TransactionPeriod): string | null {
  if (period === 'all') return null

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  if (period === '7d') start.setDate(start.getDate() - 6)
  if (period === '30d') start.setDate(start.getDate() - 29)

  return start.toISOString()
}

// One page of the history, newest first. All filtering happens in the database.
export async function listTransactions(filters: TransactionFilters): Promise<TransactionsResult> {
  const { type, period, search, page } = filters

  let query = supabase
    .from('transaction_history')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    // Containers assigned together share the same time, so this keeps their order stable
    .order('transaction_number', { ascending: false })

  if (type !== 'all') {
    query = query.eq('transaction_type', type)
  }

  const periodStart = getPeriodStart(period)
  if (periodStart) {
    query = query.gte('created_at', periodStart)
  }

  // Characters that have a special meaning in the filter syntax are removed from the search text
  const cleaned = search.replace(/[,()%*\\"]/g, ' ').trim()
  if (cleaned) {
    const conditions = [
      `customer_name.ilike.%${cleaned}%`,
      `customer_phone.ilike.%${cleaned}%`,
      `container_number.ilike.%${cleaned}%`,
    ]
    if (/^\d{1,9}$/.test(cleaned)) {
      conditions.push(`transaction_number.eq.${cleaned}`)
    }
    query = query.or(conditions.join(','))
  }

  const from = (page - 1) * TRANSACTIONS_PAGE_SIZE
  query = query.range(from, from + TRANSACTIONS_PAGE_SIZE - 1)

  const { data, count, error } = await query

  if (error) throw error

  return { rows: data, total: count ?? 0 }
}

async function countTransactionsSince(type: TransactionType, since: string): Promise<number> {
  const { count, error } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('transaction_type', type)
    .gte('created_at', since)

  if (error) throw error

  return count ?? 0
}

// How many containers were assigned and returned since midnight today
export async function getTodayCounts(): Promise<TodayCounts> {
  const startOfToday = getPeriodStart('today') ?? new Date().toISOString()

  const [assigned, returned] = await Promise.all([
    countTransactionsSince('assign', startOfToday),
    countTransactionsSince('return', startOfToday),
  ])

  return { assigned, returned }
}