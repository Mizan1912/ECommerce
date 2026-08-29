import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Table } from '../../components/ui/Table'
import { adminOrders } from '../../fixtures/admin'
import { useApp } from '../../lib/appContext'
import { formatMoney } from '../../lib/formatters'
import { OrderStatus } from '../orders/OrderStatus'

export function AdminOrdersPage() {
  const { showApiNotice } = useApp()

  return (
    <section>
      <PageHeader eyebrow="Admin" title="Orders" description="Admin status changes connect to PATCH /admin/orders/:id/status." />
      <div className="mt-5">
        <Table
          columns={['Order', 'Status', 'Payment', 'Total', '']}
          rows={adminOrders}
          renderRow={(order) => (
            <tr key={order.id}>
              <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
              <td className="px-4 py-3"><OrderStatus status={order.status} /></td>
              <td className="px-4 py-3 text-neutral-500">{order.paymentStatus}</td>
              <td className="px-4 py-3">{formatMoney(order.totalMinor, order.currency)}</td>
              <td className="px-4 py-3 text-right">
                <Button onClick={() => showApiNotice('adminApi.updateOrderStatus')} variant="secondary">
                  Update status
                </Button>
              </td>
            </tr>
          )}
        />
      </div>
    </section>
  )
}
