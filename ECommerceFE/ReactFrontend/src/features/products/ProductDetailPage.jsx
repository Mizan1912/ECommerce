import { Check, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { products } from '../../fixtures/products'
import { useApp } from '../../lib/appContext'
import { formatMoney } from '../../lib/formatters'

export function ProductDetailPage() {
  const { showApiNotice } = useApp()
  const { slug } = useParams()
  const product = products.find((item) => item.slug === slug)

  if (!product) return <Navigate replace to="/products" />

  const available = product.stock - product.reservedStock

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="grid gap-4">
        <img alt={product.title} className="aspect-[4/3] rounded-lg object-cover" src={product.images[0]} />
        <div className="grid gap-4 sm:grid-cols-2">
          {product.images.slice(1).map((image) => (
            <img alt={product.title} className="aspect-[4/3] rounded-lg object-cover" key={image} src={image} />
          ))}
        </div>
      </div>
      <div className="grid h-fit gap-5">
        <PageHeader eyebrow={product.sku} title={product.title} description={product.description} />
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="green">{product.category}</Badge>
          <Badge tone={available > 0 ? 'blue' : 'red'}>{available > 0 ? `${available} in stock` : 'Out of stock'}</Badge>
        </div>
        <p className="text-3xl font-semibold">{formatMoney(product.priceMinor, product.currency)}</p>
        <div className="grid gap-3">
          <Button onClick={() => showApiNotice('Add product to cart')}>Add to cart</Button>
          <Button onClick={() => showApiNotice('Buy now checkout')} variant="secondary">
            Buy now
          </Button>
        </div>
        <Card className="grid gap-3 p-4 text-sm text-neutral-600">
          {[
            [Truck, 'Delivery address and shipping rates connect during checkout.'],
            [ShieldCheck, 'Auth and refresh-token security are backend-owned.'],
            [PackageCheck, 'Stock is trusted from product API and rechecked at checkout.'],
            [Check, 'Money is displayed from integer minor units.'],
          ].map(([Icon, text]) => (
            <p className="flex gap-2" key={text}>
              <Icon className="mt-0.5 shrink-0 text-emerald-700" size={18} /> {text}
            </p>
          ))}
        </Card>
      </div>
    </section>
  )
}
