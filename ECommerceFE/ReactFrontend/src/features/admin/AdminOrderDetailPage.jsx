import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { Table } from '../../components/ui/Table'
import { adminApi } from '../../lib/api/client'
import { ORDER_STATUS_TONE, PAYMENT_STATUS_TONE } from '../../lib/adminConstants'
import { formatAmount, formatDateTime } from '../../lib/formatters'
import { useAdminQuery } from '../../lib/useAdminQuery'

export function AdminOrderDetailPage() {
  const { id } = useParams()
  const [busyStatus, setBusyStatus] = useState(null)

  const { data, error, loading, refetch } = useAdminQuery(() => adminApi.getOrder(id), [id])

  if (loading) return <Spinner label="Loading order…" />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const { allowedTransitions = [], order, payments = [] } = data

  const move = async (status) => {
    setBusyStatus(status)
    try {
      await adminApi.updateOrderStatus(order.orderNumber, status)
      toast.success(`Order moved to ${status}`)
      refetch()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setBusyStatus(null)
    }
  }

  return (
    <section>
      <PageHeader
        actions={
          <Button to="/admin/orders" variant="secondary">
            <ArrowLeft size={18} /> All orders
          </Button>
        }
        eyebrow="Order"
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)}${order.paidAt ? ` · Paid ${formatDateTime(order.paidAt)}` : ''}`}
      />

      <div className="mt-5 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold">Items</h2>
            <div className="mt-3">
              <Table
                columns={['Product', 'Unit price', 'Qty', 'Line total']}
                empty="This order has no items."
                rows={order.items ?? []}
                renderRow={(item, index) => (
                  <tr key={`${item.title}-${index}`}>
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3">{formatAmount(item.price)}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{formatAmount(item.price * item.quantity)}</td>
                  </tr>
                )}
              />
            </div>
            <div className="mt-4 flex justify-end gap-6 text-sm">
              <span className="text-neutral-500">Order total</span>
              <span className="text-lg font-semibold">{formatAmount(order.totalAmount)}</span>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold">Payments</h2>
            <div className="mt-3">
              <Table
                columns={['Provider', 'Provider order', 'Provider payment', 'Amount', 'Status', 'Created']}
                empty="No payment attempts recorded."
                rows={payments}
                renderRow={(payment) => (
                  <tr key={payment._id}>
                    <td className="px-4 py-3 font-medium">{payment.provider}</td>
                    <td className="px-4 py-3 text-xs text-neutral-500">{payment.providerOrderId ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-neutral-500">{payment.providerPaymentId ?? '—'}</td>
                    <td className="px-4 py-3">{formatAmount(payment.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{formatDateTime(payment.createdAt)}</td>
                  </tr>
                )}
              />
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold">Status</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={ORDER_STATUS_TONE[order.status]}>{order.status}</Badge>
              <Badge tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>payment: {order.paymentStatus}</Badge>
            </div>
            <p className="mt-4 text-sm text-neutral-500">
              {allowedTransitions.length > 0 ? 'Allowed next states:' : 'This order is in a final state.'}
            </p>
            <div className="mt-2 grid gap-2">
              {allowedTransitions.map((status) => (
                <Button
                  disabled={Boolean(busyStatus)}
                  key={status}
                  onClick={() => move(status)}
                  variant={status === 'cancelled' || status === 'refunded' ? 'secondary' : 'primary'}
                >
                  {busyStatus === status ? 'Updating…' : `Mark as ${status}`}
                </Button>
              ))}
            </div>
            {allowedTransitions.includes('cancelled') ? (
              <p className="mt-3 text-xs text-neutral-500">Cancelling returns reserved units to stock.</p>
            ) : null}
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold">Customer</h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Name</dt>
                <dd className="font-medium">{order.user?.name ?? 'Deleted user'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Email</dt>
                <dd className="truncate font-medium">{order.user?.email ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Role</dt>
                <dd className="font-medium">{order.user?.role ?? '—'}</dd>
              </div>
            </dl>
            {order.user?._id ? (
              <Button className="mt-4 w-full" to={`/admin/users?q=${encodeURIComponent(order.user.email)}`} variant="secondary">
                View in users
              </Button>
            ) : null}
          </Card>
        </div>
      </div>
    </section>
  )
}
