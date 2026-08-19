import { SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { categories, products } from '../../fixtures/products'
import { useApp } from '../../lib/appContext'
import { ProductCard } from './ProductCard'

export function ProductsPage() {
  const { showApiNotice } = useApp()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('Newest')

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => category === 'All' || product.category === category)
      .filter((product) => product.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'Price low') return a.priceMinor - b.priceMinor
        if (sort === 'Price high') return b.priceMinor - a.priceMinor
        if (sort === 'Stock') return b.stock - a.stock
        return 0
      })
  }, [category, query, sort])

  return (
    <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit p-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} />
          <h2 className="font-semibold">Filters</h2>
        </div>
        <form className="mt-4 grid gap-3" onSubmit={(event) => event.preventDefault()}>
          <Field label="Search" name="q" onChange={(event) => setQuery(event.target.value)} placeholder="Search products" value={query} />
          <Field
            as="select"
            label="Category"
            name="category"
            onChange={(event) => setCategory(event.target.value)}
            options={['All', ...categories]}
            value={category}
          />
          <Field
            as="select"
            label="Sort"
            name="sort"
            onChange={(event) => setSort(event.target.value)}
            options={['Newest', 'Price low', 'Price high', 'Stock']}
            value={sort}
          />
          <Button onClick={() => showApiNotice('Load products with filters')} variant="secondary">
            Connect API filters
          </Button>
        </form>
      </Card>
      <div>
        <PageHeader
          eyebrow="Catalogue"
          title="Products"
          description="These cards use design-only fixtures. API integration should replace the fixture list with GET /products and preserve the same product card contract."
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
