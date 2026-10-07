import { supabase } from '../lib/supabase'
import type {
  ContainerTypeSummary,
  CustomerHolding,
  TransactionHistoryRow,
} from '../types/models'

export type TopHolders = {
  holders: CustomerHolding[]
  // How many customers hold containers in total (not just the ones in the list)
  total: number
}

export async function listContainerTypeSummaries(): Promise<ContainerTypeSummary[]> {
  const { data, error } = await supabase.from('container_type_summary').select('*').order('name')

  if (error) throw error

  return data
}

// The customers holding the most containers right now
export async function listTopHolders(limit: number): Promise<TopHolders> {
  const { data, count, error } = await supabase
    .from('customer_holdings')
    .select('*', { count: 'exact' })
    .order('containers_held', { ascending: false })
    .order('full_name')
    .limit(limit)

  if (error) throw error

  return { holders: data, total: count ?? 0 }
}

// The most recent assignments and returns
export async function listRecentTransactions(limit: number): Promise<TransactionHistoryRow[]> {
  const { data, error } = await supabase
    .from('transaction_history')
    .select('*')
    .order('created_at', { ascending: false })
    .order('transaction_number', { ascending: false })
    .limit(limit)

  if (error) throw error

  return data
}