import { Loader2 } from 'lucide-react'

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
      <Loader2 className="animate-spin" size={18} />
      {label}
    </div>
  )
}
