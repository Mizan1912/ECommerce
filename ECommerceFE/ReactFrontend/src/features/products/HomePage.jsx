import { ArrowRight, ShieldCheck, Truck, WalletCards } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { ProductCard } from './ProductCard'
import { categories, products } from '../../fixtures/products'

export function HomePage() {
  const featured = products.slice(0, 3)

  return (
    <>
      <section className="grid gap-8 rounded-lg bg-neutral-950 p-6 text-white md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Design preview storefront</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
            A complete e-commerce frontend ready for your MERN API.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-300">
            Browse products, manage cart and checkout, view orders, and unlock admin tools through role-aware auth placeholders.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button to="/products" variant="secondary">
              Shop catalogue <ArrowRight size={18} />
            </Button>
            <Button className="border-white/20 text-white hover:bg-white/10" to="/login" variant="ghost">
              Login preview
            </Button>
          </div>
        </div>
        <img
          alt="Curated ecommerce products"
          className="min-h-72 rounded-lg object-cover"
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Truck, title: 'Shipping-ready checkout', text: 'Address, idempotency key, totals, and order handoff surfaces.' },
          { icon: ShieldCheck, title: 'Secure auth surfaces', text: 'Login, reset password, email verification, MFA, and role-aware admin entry.' },
          { icon: WalletCards, title: 'Payment lifecycle', text: 'Order payment states and webhook monitoring planned for integration.' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card className="p-4" key={item.title}>
              <Icon className="text-emerald-700" size={22} />
              <h2 className="mt-3 font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{item.text}</p>
            </Card>
          )
        })}
      </section>

      <section>
        <PageHeader
          actions={<Button to="/products" variant="secondary">View all</Button>}
          eyebrow="Featured"
          title="Popular products"
          description="Design-only fixture products. Replace the fixture import with GET /products when the API is ready."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section>
        <PageHeader eyebrow="Categories" title="Shop by department" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Button className="justify-between" key={category} to={`/products?category=${category}`} variant="secondary">
              {category}
              <ArrowRight size={16} />
            </Button>
          ))}
        </div>
      </section>
    </>
  )
}
