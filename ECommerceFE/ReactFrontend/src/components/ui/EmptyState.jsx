import { Button } from './Button'

export function EmptyState({ action, description, onAction, title }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
      <div className="max-w-md">
        <p className="text-base font-semibold text-neutral-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
        {action ? (
          <Button className="mt-4" onClick={onAction} variant="secondary">
            {action}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
