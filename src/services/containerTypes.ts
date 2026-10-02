import { isUniqueViolation } from '../lib/errors'
import { supabase } from '../lib/supabase'
import type { ContainerType, ContainerTypeUpdate, NewContainerType } from '../types/models'

const DUPLICATE_NAME_MESSAGE = 'A container type with that name already exists.'

export async function listContainerTypes(): Promise<ContainerType[]> {
  const { data, error } = await supabase.from('container_types').select('*').order('name')

  if (error) throw error

  return data
}

export async function createContainerType(input: NewContainerType): Promise<ContainerType> {
  const { data, error } = await supabase.from('container_types').insert(input).select().single()

  if (error) {
    if (isUniqueViolation(error)) throw new Error(DUPLICATE_NAME_MESSAGE)
    throw error
  }

  return data
}

export async function updateContainerType(
  id: string,
  changes: ContainerTypeUpdate,
): Promise<ContainerType> {
  const { data, error } = await supabase
    .from('container_types')
    .update(changes)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (isUniqueViolation(error)) throw new Error(DUPLICATE_NAME_MESSAGE)
    throw error
  }

  return data
}