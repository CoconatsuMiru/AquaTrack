import { supabase } from '../lib/supabase'

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