import { useAsyncData } from '../../hooks/useAsyncData'
import { listContainers, type ContainerWithDetails } from '../../services/containers'

const noContainers: ContainerWithDetails[] = []

export function useContainers() {
  const { data, isLoading, errorMessage, reload } = useAsyncData(listContainers, noContainers)
  return { containers: data, isLoading, errorMessage, reload }
}