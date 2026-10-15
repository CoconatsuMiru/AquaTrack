import type { ContainerWithDetails } from '../../services/containers'
import type { ContainerType } from '../../types/models'
import { normalizeSuffix } from './containerNumbers'

// The containers of one type, found by their code (so "1", "01" and "001" all find OG-01)
export type ContainerIndex = Map<string, ContainerWithDetails>

export type ContainerResolution = {
  available: ContainerWithDetails[]
  unavailable: ContainerWithDetails[]
  // Full numbers (like "OG-07") that no container has
  missing: string[]
}

export function buildContainerIndex(
  containers: ContainerWithDetails[],
  containerType: ContainerType,
): ContainerIndex {
  const prefix = `${containerType.identifier_key}-`
  const index: ContainerIndex = new Map()

  for (const container of containers) {
    if (container.container_type_id !== containerType.id) continue
    if (!container.container_number.startsWith(prefix)) continue

    const suffix = container.container_number.slice(prefix.length)
    index.set(normalizeSuffix(suffix), container)
  }

  return index
}

export function resolveContainers(
  index: ContainerIndex,
  identifierKey: string,
  suffixes: string[],
): ContainerResolution {
  const available: ContainerWithDetails[] = []
  const unavailable: ContainerWithDetails[] = []
  const missing: string[] = []

  for (const suffix of suffixes) {
    const container = index.get(normalizeSuffix(suffix))

    if (!container) {
      missing.push(`${identifierKey}-${suffix}`)
    } else if (container.status === 'available') {
      available.push(container)
    } else {
      unavailable.push(container)
    }
  }

  return { available, unavailable, missing }
}