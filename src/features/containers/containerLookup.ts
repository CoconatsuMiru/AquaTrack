import type { ContainerWithDetails } from '../../services/containers'
import type { ContainerType } from '../../types/models'

export type ContainerIndex = {
  // Containers of one type, found by their number (so "1", "01" and "001" all find PG-01)
  byNumber: Map<number, ContainerWithDetails>
  // How many digits that type's numbers usually have, used when showing missing numbers
  width: number
}

export type ContainerResolution = {
  available: ContainerWithDetails[]
  unavailable: ContainerWithDetails[]
  // Numbers with no container at all
  missing: number[]
}

export function buildContainerIndex(
  containers: ContainerWithDetails[],
  containerType: ContainerType,
): ContainerIndex {
  const prefix = `${containerType.identifier_key}-`
  const byNumber = new Map<number, ContainerWithDetails>()
  let width = 2

  for (const container of containers) {
    if (container.container_type_id !== containerType.id) continue
    if (!container.container_number.startsWith(prefix)) continue

    const digits = container.container_number.slice(prefix.length)
    if (!/^\d+$/.test(digits)) continue

    byNumber.set(Number(digits), container)
    width = Math.max(width, digits.length)
  }

  return { byNumber, width }
}

export function resolveContainers(index: ContainerIndex, numbers: number[]): ContainerResolution {
  const available: ContainerWithDetails[] = []
  const unavailable: ContainerWithDetails[] = []
  const missing: number[] = []

  for (const number of numbers) {
    const container = index.byNumber.get(number)

    if (!container) {
      missing.push(number)
    } else if (container.status === 'available') {
      available.push(container)
    } else {
      unavailable.push(container)
    }
  }

  return { available, unavailable, missing }
}