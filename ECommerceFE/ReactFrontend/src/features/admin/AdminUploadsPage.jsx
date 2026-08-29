import { ImagePlus, Search, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { adminApi } from '../../lib/api/client'
import { PAGE_SIZE } from '../../lib/adminConstants'
import { useAdminQuery } from '../../lib/useAdminQuery'

export function AdminUploadsPage() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [products, setProducts] = useState(null)

  const { data, error, loading, meta, refetch } = useAdminQuery(
    () => adminApi.listProducts({ limit: PAGE_SIZE, page, ...(query ? { q: query } : {}) }),
    [query, page],
  )

  const items = products ?? data ?? []

  const reload = async () => {
    setProducts(null)
    await refetch()
  }

  const patchProduct = (updated) =>
    setProducts(items.map((item) => (item._id === updated._id ? updated : item)))

  const applySearch = (event) => {
    event.preventDefault()
    setPage(1)
    setProducts(null)
    setQuery(search.trim())
  }

  const upload = async (event) => {
    const files = event.target.files
    if (!selectedId) {
      toast.error('Choose a product first.')
      event.target.value = ''
      return
    }
    if (!files?.length) return

    setUploading(true)
    try {
      const response = await adminApi.uploadProductImages(selectedId, files)
      patchProduct(response.data)
      toast.success(`${files.length} image(s) uploaded`)
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const removeImage = async (productId, imageId) => {
    try {
      const response = await adminApi.deleteProductImage(productId, imageId)
      patchProduct(response.data)
      toast.success('Image removed')
    } catch (requestError) {
      toast.error(requestError.message)
    }
  }

  const makePrimary = async (productId, imageId) => {
    try {
      const response = await adminApi.setPrimaryImage(productId, imageId)
      patchProduct(response.data)
      toast.success('Primary image updated')
    } catch (requestError) {
      toast.error(requestError.message)
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit p-4">
        <PageHeader eyebrow="Images" title="Product uploads" />
        <div className="mt-5 grid gap-4">
          <Field
            as="select"
            hint="Only products on this page are listed."
            label="Product"
            name="productId"
            onChange={(event) => setSelectedId(event.target.value)}
            options={[
              { label: 'Select a product…', value: '' },
              ...items.map((product) => ({ label: product.title, value: product._id })),
            ]}
            value={selectedId}
          />
          <label className="grid min-h-40 cursor-pointer place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-neutral-500 hover:border-neutral-400">
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading || !selectedId}
              multiple
              onChange={upload}
              type="file"
            />
            <span className="flex flex-col items-center gap-2">
              <ImagePlus size={22} />
              {uploading ? 'Uploading…' : 'Click to choose images'}
              <span className="text-xs">JPEG, PNG, WEBP · max 2MB each · up to 5 files</span>
            </span>
          </label>
          <p className="text-xs text-neutral-500">
            Files are streamed to Cloudinary by the backend. Configure CLOUDINARY_* in the API .env before uploading.
          </p>
        </div>
      </Card>

      <div>
        <PageHeader eyebrow="Storage" title="Media library" description="Every catalogue image, grouped by product." />

        <Card className="mt-5 p-4">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={applySearch}>
            <Field
              label="Search products"
              name="q"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Title, slug, or category"
              value={search}
            />
            <Button type="submit" variant="secondary">
              <Search size={16} /> Search
            </Button>
          </form>
        </Card>

        <div className="mt-5">
          {loading ? (
            <Spinner label="Loading media…" />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : (
            <>
              <div className="grid gap-4">
                {items.length === 0 ? (
                  <Card className="p-8 text-center text-sm text-neutral-500">No products found.</Card>
                ) : (
                  items.map((product) => (
                    <Card className="p-4" key={product._id}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <Link className="font-semibold hover:underline" to={`/admin/products/${product._id}/edit`}>
                            {product.title}
                          </Link>
                          <p className="text-xs text-neutral-500">{product.category}</p>
                        </div>
                        <Badge tone={product.images?.length ? 'green' : 'amber'}>
                          {product.images?.length ?? 0} image(s)
                        </Badge>
                      </div>

                      {product.images?.length ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                          {product.images.map((image) => (
                            <figure
                              className="overflow-hidden rounded-lg border border-neutral-200"
                              key={image._id ?? image.publicId}
                            >
                              <img alt="" className="h-24 w-full object-cover" src={image.url} />
                              <figcaption className="flex items-center justify-between gap-1 px-2 py-2">
                                {image.isPrimary ? (
                                  <Badge tone="green">Primary</Badge>
                                ) : (
                                  <button
                                    className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-950"
                                    onClick={() => makePrimary(product._id, image._id ?? image.publicId)}
                                    type="button"
                                  >
                                    <Star size={14} /> Primary
                                  </button>
                                )}
                                <button
                                  aria-label="Delete image"
                                  className="rounded p-1 text-red-600 hover:bg-red-50"
                                  onClick={() => removeImage(product._id, image._id ?? image.publicId)}
                                  type="button"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-neutral-500">No images uploaded yet.</p>
                      )}
                    </Card>
                  ))
                )}
              </div>
              <Pagination
                onPageChange={(next) => {
                  setProducts(null)
                  setPage(next)
                }}
                pagination={meta?.pagination}
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
