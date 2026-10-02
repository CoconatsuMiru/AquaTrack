import { useAsyncData } from '../../hooks/useAsyncData'
import { listCustomers, type CustomerWithHeldCount } from '../../services/customers'

const noCustomers: CustomerWithHeldCount[] = []

export function useCustomers() {
  const { data, isLoading, errorMessage, reload } = useAsyncData(listCustomers, noCustomers)
  return { customers: data, isLoading, errorMessage, reload }
}