import { fetchAllRows } from '../lib/fetchAllRows'
import { supabase } from '../lib/supabase'
import type { Customer, NewCustomer } from '../types/models'

export type CustomerWithHeldCount = Customer & {
  containers_held: number
}

export async function listCustomers(): Promise<CustomerWithHeldCount[]> {
  const rows = await fetchAllRows((from, to) =>
    supabase
      .from('customers')
      .select('*, containers(count)')
      .order('full_name')
      .order('id')
      .range(from, to),
  )

  return rows.map(({ containers, ...customer }) => ({
    ...customer,
    containers_held: containers[0]?.count ?? 0,
  }))
}

export async function createCustomer(customer: NewCustomer): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single()

  if (error) throw error

  return data
}