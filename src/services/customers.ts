import { supabase } from '../lib/supabase'
import type { Customer, NewCustomer } from '../types/models'

export type CustomerWithHeldCount = Customer & {
  containers_held: number
}

export async function listCustomers(): Promise<CustomerWithHeldCount[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*, containers(count)')
    .order('full_name')

  if (error) throw error

  return data.map(({ containers, ...customer }) => ({
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