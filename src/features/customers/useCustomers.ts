import { useEffect, useState } from 'react'
import { getErrorMessage } from '../../lib/errors'
import { listCustomers, type CustomerWithHeldCount } from '../../services/customers'

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerWithHeldCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const data = await listCustomers()
        if (!ignore) {
          setCustomers(data)
          setErrorMessage('')
        }
      } catch (error) {
        if (!ignore) setErrorMessage(getErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [reloadCount])

  function reload() {
    setReloadCount((count) => count + 1)
  }

  return { customers, isLoading, errorMessage, reload }
}