import { Check, Minus, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { Table } from '../../components/ui/Table'
import { adminApi } from '../../lib/api/client'
import { LOW_STOCK_THRESHOLD, PAGE_SIZE } from '../../lib/adminConstants'
import { formatAmount } from '../../lib/formatters'
import { useAdminQuery } from '../../lib/useAdminQuery'

function StockRow({ onUpdated, product }) {
  const [value, setValue] = useState(String(product.stock))
  const [busy, setBusy] = useState(false)

  const commit = async (payload) => {
    setBusy(true)
    try {
      const response = await adminApi.adjustStock(product._id, payload)
      setValue(String(response.data.stock))
      toast.success(`${product.title}: stock is now ${response.data.stock}`)
      onUpdated()
    } catch (error) {
      toast.error(error.message)
      setValue(String(product.stock))
    } finally {
      setBusy(false)
    }
  }

  const setAbsolute = () => {
    const next = Number(value)
    if (!Number.isInteger(next) || next < 0) {
      toast.error('Enter a whole number of 0 or more.')
      return
    }
    if (next === product.stock) return
    commit({ stock: next })
  }

  return (
    <tr key={product._id}>
      <td className="px-4 py-3">
        <span className="block font-medium">{product.title}</span>
        <span className="block text-xs text-neutral-500">{product.category}</span>
      </td>
      <td className="px-4 py-3 text-neutral-500">{formatAmount(product.price)}</td>
      <td className="px-4 py-3">
        <Badge
          tone={product.stock === 0 ? 'red' : product.stock <= LOW_STOCK_THRESHOLD ? 'amber' : 'green'}
        >
          {product.stock === 0 ? 'Out of stock' : product.stock <= LOW_STOCK_THRESHOLD ? 'Low' : 'Healthy'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button className="px-2" disabled={busy} onClick={() => commit({ delta: -1 })} variant="secondary">
            <Minus size={16} />
          </Button>
          <input
            aria-label={`Stock for ${product.title}`}
            className="h-10 w-20 rounded-lg border border-neutral-200 px-2 text-center text-sm"
            disabled={busy}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && setAbsolute()}
            type="number"
            value={value}
          />
          <Button className="px-2" disabled={busy} onClick={() => commit({ delta: 1 })} variant="secondary">
            <Plus size={16} />
          </Button>
          <Button
            className="px-2"
            disabled={busy || Number(value) === product.stock}
            onClick={setAbsolute}
            title="Save exact count"
            variant="secondary"
          >
            <Check size={16} />
          </Button>
        </div>
      </td>
    </tr>
  )
}

export function AdminInventoryPage() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, error, loading, meta, refetch } = useAdminQuery(
    () =>
      adminApi.listProducts({
        limit: PAGE_SIZE,
        page,
        sort: 'stock',
        ...(query ? { q: query } : {}),
        ...(stockFilter ? { stock: stockFilter } : {}),
      }),
    [query, stockFilter, page],
  )

  const applySearch = (event) => {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  return (
    <section>
      <PageHeader
        eyebrow="Inventory"
        title="Stock levels"
        description={`Adjust by ±1, or type an exact count and save. Items at or below ${LOW_STOCK_THRESHOLD} units are flagged as low.`}
      />

      <Card className="mt-5 p-4">
        <form className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end" onSubmit={applySearch}>
          <Field
            label="Search products"
            name="q"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Title, slug, or category"
            value={search}
          />
          <Field
            as="select"
            label="Stock filter"
            name="stock"
            onChange={(event) => {
              setPage(1)
              setStockFilter(event.target.value)
            }}
            options={[
              { label: 'All products', value: '' },
              { label: 'Low stock', value: 'low' },
              { label: 'Out of stock', value: 'out' },
            ]}
            value={stockFilter}
          />
          <Button type="submit" variant="secondary">
            <Search size={16} /> Search
          </Button>
        </form>
      </Card>

      <div className="mt-5">
        {loading ? (
          <Spinner label="Loading inventory…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <>
            <Table
              columns={['Product', 'Price', 'Health', <span className="block text-right" key="adjust">Adjust stock</span>]}
              empty="No products match this filter."
              rows={data ?? []}
              renderRow={(product) => <StockRow key={product._id} onUpdated={refetch} product={product} />}
            />
            <Pagination onPageChange={setPage} pagination={meta?.pagination} />
          </>
        )}
      </div>
    </section>
  )
}
