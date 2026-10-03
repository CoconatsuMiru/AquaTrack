import { isUniqueViolation } from '../lib/errors'
import { supabase } from '../lib/supabase'
import type { Container, ContainerStatus, NewContainer } from '../types/models'

export type ContainerWithDetails = Container & {
  type_name: string
  customer_name: string | null
}

export async function listContainers(): Promise<ContainerWithDetails[]> {
  const { data, error } = await supabase
    .from('containers')
    .select('*, container_types(name), customers(full_name)')
    .order('container_number')

  if (error) throw error

  return data.map(({ container_types, customers, ...container }) => ({
    ...container,
    type_name: container_types?.name ?? 'Unknown type',
    customer_name: customers?.full_name ?? null,
  }))
}

// Saves all containers together: either every one is created, or none are.
export async function createContainers(inputs: NewContainer[]): Promise<void> {
  const { error } = await supabase.from('containers').insert(inputs)

  if (error) {
    if (isUniqueViolation(error)) {
      throw new Error(
        'One or more of those container numbers already exist. Refresh the page and try again.',
      )
    }
    throw error
  }
}

// Only changes the status if the container is still in the expected one,
// so a stale screen can never overwrite a newer change.
async function changeStatus(id: string, from: ContainerStatus, to: ContainerStatus) {
  const { data, error } = await supabase
    .from('containers')
    .update({ status: to })
    .eq('id', id)
    .eq('status', from)
    .select('id')

  if (error) throw error

  if (data.length === 0) {
    throw new Error('This container changed in the meantime. Please refresh and try again.')
  }
}

export async function retireContainer(id: string) {
  await changeStatus(id, 'available', 'retired')
}

export async function restoreContainer(id: string) {
  await changeStatus(id, 'retired', 'available')
}