import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { useApp } from '../../lib/appContext'
import { formatMoney } from '../../lib/formatters'

export function CartPage() {
  const { cartItems, removeCartItem, showApiNotice, updateCartQuantity } = useApp()
  const subtotal = cartItems.reduce((total, item) => total + item.product.priceMinor * item.quantity, 0)

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <PageHeader eyebrow="Cart" title="Shopping cart" description="Quantity controls update preview state only. Wire these to cart endpoints later." />
        <div className="mt-5 grid gap-3">
          {cartItems.length === 0 ? (
            <EmptyState action="Browse products" description="Your cart preview is empty." title="No cart items" />
          ) : (
            cartItems.map((item) => (
              <Card className="grid gap-4 p-4 sm:grid-cols-[96px_1fr_auto]" key={item.product.id}>
                <img alt={item.product.title} className="size-24 rounded-lg object-cover" src={item.product.images[0]} />
                <div>
                  <h2 className="font-semibold">{item.product.title}</h2>
                  <p className="mt-1 text-sm text-neutral-500">{item.product.category}</p>
                  <p className="mt-2 font-semibold">{formatMoney(item.product.priceMinor, item.product.currency)}</p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Button className="px-3" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} variant="secondary">
                    <Minus size={16} />
                  </Button>
                  <span className="grid size-10 place-items-center rounded-lg border border-neutral-200 bg-white text-sm font-semibold">{item.quantity}</span>
                  <Button className="px-3" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} variant="secondary">
                    <Plus size={16} />
                  </Button>
                  <Button className="px-3" onClick={() => removeCartItem(item.product.id)} variant="ghost">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
      <Card className="h-fit p-4">
        <h2 className="font-semibold">Order summary</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <p className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </p>
          <p className="flex justify-between text-neutral-600">
            <span>Shipping</span>
            <span>Calculated later</span>
          </p>
          <p className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatMoney(subtotal)}</span>
          </p>
        </div>
        <Button className="mt-4 w-full" to="/checkout">
          Checkout
        </Button>
        <Button className="mt-2 w-full" onClick={() => showApiNotice('Clear cart')} variant="secondary">
          Connect clear cart API
        </Button>
      </Card>
    </section>
  )
}
