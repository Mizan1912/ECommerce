import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({ message, onRetry }) {
  return (
    <div className="grid place-items-center rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <AlertTriangle className="text-red-600" size={22} />
      <p className="mt-2 text-sm font-medium text-red-800">{message || 'Something went wrong.'}</p>
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry} variant="secondary">
          Try again
        </Button>
      ) : null}
    </div>
  )
}
