import { Edit, Plus, Power, RotateCcw, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ErrorState } from '../../components/ui/ErrorState'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { Table } from '../../components/ui/Table'
import { adminApi } from '../../lib/api/client'
import { PAGE_SIZE } from '../../lib/adminConstants'
import { formatAmount, formatDate } from '../../lib/formatters'
import { useAdminQuery } from '../../lib/useAdminQuery'

export function AdminProductsPage() {
  const [filters, setFilters] = useState({ category: '', q: '', status: 'all', stock: '' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, error, loading, meta, refetch } = useAdminQuery(
    () =>
      adminApi.listProducts({
        limit: PAGE_SIZE,
        page,
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
        ...(filters.stock ? { stock: filters.stock } : {}),
      }),
    [filters.q, filters.category, filters.status, filters.stock, page],
  )

  const applySearch = (event) => {
    event.preventDefault()
    setPage(1)
    setFilters((prev) => ({ ...prev, q: search.trim() }))
  }

  const updateFilter = (key, value) => {
    setPage(1)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const toggleActive = async (product) => {
    try {
      await adminApi.updateProduct(product._id, { isActive: !product.isActive })
      toast.success(`${product.title} ${product.isActive ? 'deactivated' : 'activated'}`)
      refetch()
    } catch (requestError) {
      toast.error(requestError.message)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setBusy(true)
    try {
      await adminApi.deleteProduct(pendingDelete._id, { hard: true })
      toast.success('Product deleted permanently')
      setPendingDelete(null)
      refetch()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  const categories = meta?.categories ?? []

  return (
    <section>
      <PageHeader
        actions={
          <Button to="/admin/products/new">
            <Plus size={18} /> New product
          </Button>
        }
        eyebrow="Admin"
        title="Products"
        description="Full catalogue including deactivated items. Deactivating hides a product from the storefront without losing order history."
      />

      <Card className="mt-5 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <form className="md:col-span-2" onSubmit={applySearch}>
            <Field
              label="Search"
              name="q"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Title, slug, or category"
              value={search}
            />
            <Button className="mt-2" type="submit" variant="secondary">
              <Search size={16} /> Search
            </Button>
          </form>
          <Field
            as="select"
            label="Category"
            name="category"
            onChange={(event) => updateFilter('category', event.target.value)}
            options={[{ label: 'All categories', value: '' }, ...categories.map((c) => ({ label: c, value: c }))]}
            value={filters.category}
          />
          <div className="grid gap-3">
            <Field
              as="select"
              label="Status"
              name="status"
              onChange={(event) => updateFilter('status', event.target.value)}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
              value={filters.status}
            />
            <Field
              as="select"
              label="Stock"
              name="stock"
              onChange={(event) => updateFilter('stock', event.target.value)}
              options={[
                { label: 'Any', value: '' },
                { label: 'Low stock', value: 'low' },
                { label: 'Out of stock', value: 'out' },
              ]}
              value={filters.stock}
            />
          </div>
        </div>
      </Card>

      <div className="mt-5">
        {loading ? (
          <Spinner label="Loading products…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <>
            <Table
              columns={['Product', 'Category', 'Price', 'Stock', 'Status', 'Created', '']}
              empty="No products match these filters."
              rows={data ?? []}
              renderRow={(product) => (
                <tr key={product._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0]?.url ? (
                        <img
                          alt=""
                          className="size-10 rounded-lg border border-neutral-200 object-cover"
                          src={product.images.find((image) => image.isPrimary)?.url ?? product.images[0].url}
                        />
                      ) : (
                        <span className="grid size-10 place-items-center rounded-lg bg-neutral-100 text-xs text-neutral-400">
                          —
                        </span>
                      )}
                      <span>
                        <span className="block font-medium">{product.title}</span>
                        <span className="block text-xs text-neutral-500">{product.slug}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{product.category}</td>
                  <td className="px-4 py-3">{formatAmount(product.price)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={product.stock === 0 ? 'red' : product.stock <= 5 ? 'amber' : 'default'}>
                      {product.stock}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={product.isActive ? 'green' : 'default'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{formatDate(product.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button className="px-3" to={`/admin/products/${product._id}/edit`} variant="secondary">
                        <Edit size={16} />
                      </Button>
                      <Button
                        className="px-3"
                        onClick={() => toggleActive(product)}
                        title={product.isActive ? 'Deactivate' : 'Activate'}
                        variant="secondary"
                      >
                        {product.isActive ? <Power size={16} /> : <RotateCcw size={16} />}
                      </Button>
                      <Button className="px-3" onClick={() => setPendingDelete(product)} variant="secondary">
                        <Trash2 className="text-red-600" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            />
            <Pagination onPageChange={setPage} pagination={meta?.pagination} />
          </>
        )}
      </div>

      <ConfirmDialog
        busy={busy}
        confirmLabel="Delete permanently"
        description={`"${pendingDelete?.title}" will be removed from the database along with its images. Products that appear in existing orders cannot be deleted — deactivate them instead.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        open={Boolean(pendingDelete)}
        title="Delete product?"
      />
    </section>
  )
}
