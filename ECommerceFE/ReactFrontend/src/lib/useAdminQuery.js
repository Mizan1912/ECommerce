import { useEffect, useRef, useState } from 'react'

/**
 * Small data-fetching helper for the admin screens.
 * `fetcher` must resolve to the backend envelope: { data, meta }.
 * `deps` is serialised into a cache key, so the request re-runs whenever a
 * filter, page, or route param changes.
 */
export function useAdminQuery(fetcher, deps = []) {
  const key = JSON.stringify(deps)
  const fetcherRef = useRef(fetcher)

  // Keep the latest closure without reading the ref during render. This effect
  // is declared first, so it commits before the fetching effect below runs.
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const [nonce, setNonce] = useState(0)
  const [result, setResult] = useState({ data: null, error: null, key: null, meta: null })

  useEffect(() => {
    let active = true

    fetcherRef
      .current()
      .then((response) => {
        if (!active) return
        setResult({ data: response?.data ?? null, error: null, key, meta: response?.meta ?? null })
      })
      .catch((error) => {
        if (!active) return
        setResult({ data: null, error: error.message || 'Request failed', key, meta: null })
      })

    return () => {
      active = false
    }
  }, [key, nonce])

  const loading = result.key !== key

  return {
    data: loading ? null : result.data,
    error: loading ? null : result.error,
    loading,
    meta: loading ? null : result.meta,
    refetch: () => setNonce((value) => value + 1),
  }
}
