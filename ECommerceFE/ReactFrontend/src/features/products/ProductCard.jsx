import { ShoppingBag, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { formatMoney } from '../../lib/formatters'
import { useApp } from '../../lib/appContext'

export function ProductCard({ product }) {
  const { showApiNotice } = useApp()
  const available = product.stock - product.reservedStock

  return (
    <article className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <Link to={`/products/${product.slug}`}>
        <img alt={product.title} className="aspect-[4/3] w-full object-cover" src={product.images[0]} />
      </Link>
      <div className="grid gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone="green">{product.category}</Badge>
            <Link className="mt-2 block font-semibold text-neutral-950 hover:underline" to={`/products/${product.slug}`}>
              {product.title}
            </Link>
          </div>
          <p className="font-semibold">{formatMoney(product.priceMinor, product.currency)}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span className="flex items-center gap-1">
            <Star className="fill-amber-400 text-amber-400" size={16} /> {product.rating}
          </span>
          <span>{available} available</span>
        </div>
        <Button onClick={() => showApiNotice('Add item to cart')}>
          <ShoppingBag size={18} />
          Add to cart
        </Button>
      </div>
    </article>
  )
}
