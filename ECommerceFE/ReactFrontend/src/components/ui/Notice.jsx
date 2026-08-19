import { X } from 'lucide-react'
import { useApp } from '../../lib/appContext'

export function Notice() {
  const { clearNotice, notice } = useApp()

  if (!notice) return null

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p>{notice}</p>
      <button
        aria-label="Close notice"
        className="rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950"
        onClick={clearNotice}
        type="button"
      >
        <X size={16} />
      </button>
    </div>
  )
}
