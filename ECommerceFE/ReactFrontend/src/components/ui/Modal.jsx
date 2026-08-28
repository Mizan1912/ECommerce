import { X } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({ children, footer, onClose, open, size = 'md', title }) {
  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  if (!open) return null

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/50 p-4 sm:p-8">
      <div
        aria-modal="true"
        className={`w-full ${widths[size]} rounded-xl border border-neutral-200 bg-white shadow-xl`}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
          <button
            aria-label="Close dialog"
            className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}
