'use client'

import { useEffect, useState } from 'react'

type AsyncState<T> = {
  data?: T
  error?: Error
  loading: boolean
}

export function useAsyncData<T>(key: string | null, fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ loading: Boolean(key) })

  useEffect(() => {
    let cancelled = false

    if (!key) {
      setState({ data: undefined, loading: false })
      return () => {
        cancelled = true
      }
    }

    setState((prev) => ({ ...prev, loading: true, error: undefined }))

    fetcher()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false })
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setState({ error, loading: false })
        }
      })

    return () => {
      cancelled = true
    }
  }, [key, ...deps])

  return state
}
