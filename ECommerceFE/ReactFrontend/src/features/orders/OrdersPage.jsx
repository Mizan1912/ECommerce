import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { orders } from '../../fixtures/orders'
import { formatMoney } from '../../lib/formatters'
import { OrderStatus } from './OrderStatus'

export function OrdersPage() {
  return (
    <section>
      <PageHeader
        eyebrow="Orders"
        title="Order history"
        description="Design-only order records show how GET /orders and GET /orders/:id will render after auth is connected."
      />
      <div className="mt-5 grid gap-3">
        {orders.map((order) => (
          <Card className="grid gap-4 p-4 md:grid-cols-[1fr_auto]" key={order.id}>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-semibold">{order.orderNumber}</h2>
                <OrderStatus status={order.status} />
              </div>
              <p className="mt-2 text-sm text-neutral-500">{order.items.length} item groups ordered on {order.createdAt}</p>
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <p className="font-semibold">{formatMoney(order.totalMinor, order.currency)}</p>
              <Button to={`/orders/${order.id}`} variant="secondary">
                View
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
