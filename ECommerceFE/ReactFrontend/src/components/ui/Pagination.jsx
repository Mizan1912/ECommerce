import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

export function Pagination({ onPageChange, pagination }) {
  if (!pagination) return null

  const { limit = 10, page = 1, total = 0, totalPages = 1 } = pagination
  const first = total === 0 ? 0 : (page - 1) * limit + 1
  const last = Math.min(page * limit, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-sm text-neutral-600">
      <p>
        Showing <span className="font-medium text-neutral-950">{first}</span>–
        <span className="font-medium text-neutral-950">{last}</span> of{' '}
        <span className="font-medium text-neutral-950">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button className="px-3" disabled={page <= 1} onClick={() => onPageChange(page - 1)} variant="secondary">
          <ChevronLeft size={16} />
          Prev
        </Button>
        <span className="px-1">
          Page {page} of {totalPages}
        </span>
        <Button
          className="px-3"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          variant="secondary"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
