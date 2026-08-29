import { Button } from './Button'
import { Modal } from './Modal'

export function ConfirmDialog({
  busy = false,
  confirmLabel = 'Confirm',
  description,
  onCancel,
  onConfirm,
  open,
  title,
}) {
  return (
    <Modal
      onClose={onCancel}
      open={open}
      size="sm"
      title={title}
      footer={
        <>
          <Button disabled={busy} onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button disabled={busy} onClick={onConfirm}>
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-neutral-600">{description}</p>
    </Modal>
  )
}
