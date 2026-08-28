import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Small data-fetching helper for the admin screens.
 * `fetcher` must return the backend envelope: { data, meta }.
 */
export function useAdminQuery(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true, meta: null })
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const run = useCallback(async () => {
    setState((prev) => ({ ...prev, error: null, loading: true }))
    try {
      const response = await fetcher()
      if (!mounted.current) return
      setState({ data: response?.data ?? null, error: null, loading: false, meta: response?.meta ?? null })
    } catch (error) {
      if (!mounted.current) return
      setState({ data: null, error: error.message || 'Request failed', loading: false, meta: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { ...state, refetch: run }
}
