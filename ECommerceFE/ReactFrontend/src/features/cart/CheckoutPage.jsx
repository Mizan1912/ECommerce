import { v4 as uuidNote } from './uuidNote'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { useApp } from '../../lib/appContext'
import { formatMoney } from '../../lib/formatters'

export function CheckoutPage() {
  const { cartItems, showApiNotice } = useApp()
  const subtotal = cartItems.reduce((total, item) => total + item.product.priceMinor * item.quantity, 0)

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <PageHeader
          eyebrow="Checkout"
          title="Shipping and payment handoff"
          description="This form is ready for POST /checkout. No checkout request is sent until the API client is connected."
        />
        <Card className="mt-5 p-4">
          <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" name="name" placeholder="Shipping recipient" />
              <Field label="Phone" name="phone" placeholder="+91 98765 43210" />
            </div>
            <Field label="Address line" name="address" placeholder="House, street, area" />
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="City" name="city" placeholder="Mumbai" />
              <Field label="State" name="state" placeholder="Maharashtra" />
              <Field label="PIN code" name="postalCode" placeholder="400001" />
            </div>
            <Field label="Idempotency-Key header" name="idempotencyKey" placeholder={uuidNote} />
            <Button onClick={() => showApiNotice('Create checkout with Idempotency-Key')}>Place order</Button>
          </form>
        </Card>
      </div>
      <Card className="h-fit p-4">
        <h2 className="font-semibold">Checkout summary</h2>
        <div className="mt-4 grid gap-3">
          {cartItems.map((item) => (
            <p className="flex justify-between gap-4 text-sm" key={item.product.id}>
              <span className="text-neutral-600">
                {item.product.title} x {item.quantity}
              </span>
              <span className="font-medium">{formatMoney(item.product.priceMinor * item.quantity)}</span>
            </p>
          ))}
          <p className="flex justify-between border-t border-neutral-200 pt-3 font-semibold">
            <span>Total</span>
            <span>{formatMoney(subtotal)}</span>
          </p>
        </div>
      </Card>
    </section>
  )
}
