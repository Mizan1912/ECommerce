import { Badge } from '../../components/ui/Badge'

const statusTone = {
  delivered: 'green',
  paid: 'blue',
  payment_failed: 'red',
  pending_payment: 'amber',
  shipped: 'blue',
}

export function OrderStatus({ status }) {
  return <Badge tone={statusTone[status] ?? 'default'}>{status.replaceAll('_', ' ')}</Badge>
}
