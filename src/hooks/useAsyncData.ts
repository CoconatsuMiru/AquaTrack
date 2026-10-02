import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../lib/errors'

// Pass a stable function (like a service function), not an inline arrow function,
// otherwise the data would reload on every render.
export function useAsyncData<T>(fetcher: () => Promise<T>, initialData: T) {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const result = await fetcher()
        if (!ignore) {
          setData(result)
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
  }, [fetcher, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  return { data, isLoading, errorMessage, reload }
}