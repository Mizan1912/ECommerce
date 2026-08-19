import { Navigate, useParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { orders } from '../../fixtures/orders'
import { formatMoney } from '../../lib/formatters'
import { OrderStatus } from './OrderStatus'

const timeline = ['pending_payment', 'paid', 'shipped', 'delivered']

export function OrderDetailPage() {
  const { id } = useParams()
  const order = orders.find((item) => item.id === id)

  if (!order) return <Navigate replace to="/orders" />

  const activeIndex = Math.max(0, timeline.indexOf(order.status))

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <PageHeader eyebrow="Order detail" title={order.orderNumber} description={`Shipping to ${order.address}`} />
        <Card className="mt-5 p-4">
          <div className="grid gap-4">
            {order.items.map((item) => (
              <div className="grid gap-4 border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[80px_1fr_auto]" key={item.product.id}>
                <img alt={item.product.title} className="size-20 rounded-lg object-cover" src={item.product.images[0]} />
                <div>
                  <h2 className="font-semibold">{item.product.title}</h2>
                  <p className="text-sm text-neutral-500">Qty {item.quantity}</p>
                </div>
                <p className="font-semibold">{formatMoney(item.unitPriceMinor * item.quantity, order.currency)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="h-fit p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Status</h2>
          <OrderStatus status={order.status} />
        </div>
        <div className="mt-5 grid gap-3">
          {timeline.map((step, index) => (
            <div className="flex items-center gap-3" key={step}>
              <span className={`size-3 rounded-full ${index <= activeIndex ? 'bg-emerald-600' : 'bg-neutral-200'}`} />
              <span className="text-sm capitalize text-neutral-600">{step.replaceAll('_', ' ')}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 flex justify-between border-t border-neutral-200 pt-4 font-semibold">
          <span>Total</span>
          <span>{formatMoney(order.totalMinor, order.currency)}</span>
        </p>
      </Card>
    </section>
  )
}
