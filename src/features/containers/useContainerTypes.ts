import { useAsyncData } from '../../hooks/useAsyncData'
import { listContainerTypes } from '../../services/containerTypes'
import type { ContainerType } from '../../types/models'

const noTypes: ContainerType[] = []

export function useContainerTypes() {
  const { data, isLoading, errorMessage, reload } = useAsyncData(listContainerTypes, noTypes)
  return { containerTypes: data, isLoading, errorMessage, reload }
}