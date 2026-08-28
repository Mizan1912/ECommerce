import { ArrowLeft, ImagePlus, Star, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { adminApi } from '../../lib/api/client'
import { formatAmount } from '../../lib/formatters'

const EMPTY_FORM = {
  category: '',
  description: '',
  isActive: 'true',
  price: '',
  stock: '',
  title: '',
}

function validate(form) {
  const errors = {}

  if (form.title.trim().length < 3) errors.title = 'Title needs at least 3 characters.'
  if (form.description.trim().length < 10) errors.description = 'Description needs at least 10 characters.'
  if (form.category.trim().length < 2) errors.category = 'Category needs at least 2 characters.'
  if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
    errors.price = 'Enter a price of 0 or more.'
  }
  if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
    errors.stock = 'Enter a whole number of 0 or more.'
  }

  return errors
}

function ImageManager({ onChange, product }) {
  const [uploading, setUploading] = useState(false)

  const upload = async (event) => {
    const files = event.target.files
    if (!files?.length) return

    setUploading(true)
    try {
      const response = await adminApi.uploadProductImages(product._id, files)
      onChange(response.data)
      toast.success('Images uploaded')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const remove = async (imageId) => {
    try {
      const response = await adminApi.deleteProductImage(product._id, imageId)
      onChange(response.data)
      toast.success('Image removed')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const makePrimary = async (imageId) => {
    try {
      const response = await adminApi.setPrimaryImage(product._id, imageId)
      onChange(response.data)
      toast.success('Primary image updated')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Card className="p-4">
      <PageHeader eyebrow="Media" title="Product images" />
      <p className="mt-2 text-sm text-neutral-500">
        JPEG, PNG, or WEBP up to 2MB each, 5 files per upload. Images are stored on Cloudinary.
      </p>

      <label className="mt-4 grid min-h-32 cursor-pointer place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-neutral-500 hover:border-neutral-400">
        <input
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          multiple
          onChange={upload}
          type="file"
        />
        <span className="flex items-center gap-2">
          <ImagePlus size={18} />
          {uploading ? 'Uploading…' : 'Click to select images'}
        </span>
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(product.images ?? []).map((image) => (
          <figure className="overflow-hidden rounded-lg border border-neutral-200" key={image._id ?? image.publicId}>
            <img alt="" className="h-28 w-full object-cover" src={image.url} />
            <figcaption className="flex items-center justify-between gap-1 px-2 py-2">
              {image.isPrimary ? (
                <Badge tone="green">Primary</Badge>
              ) : (
                <button
                  className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-950"
                  onClick={() => makePrimary(image._id ?? image.publicId)}
                  type="button"
                >
                  <Star size={14} /> Set primary
                </button>
              )}
              <button
                aria-label="Delete image"
                className="rounded p-1 text-red-600 hover:bg-red-50"
                onClick={() => remove(image._id ?? image.publicId)}
                type="button"
              >
                <Trash2 size={14} />
              </button>
            </figcaption>
          </figure>
        ))}
      </div>

      {(product.images ?? []).length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">No images yet.</p>
      ) : null}
    </Card>
  )
}

export function AdminProductEditorPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [form, setForm] = useState(EMPTY_FORM)
  const [product, setProduct] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return

    // `loading` already starts true for edit mode, so no sync setState here.
    let active = true
    adminApi
      .getProduct(id)
      .then((response) => {
        if (!active) return
        const item = response.data
        setProduct(item)
        setForm({
          category: item.category ?? '',
          description: item.description ?? '',
          isActive: String(item.isActive),
          price: String(item.price ?? ''),
          stock: String(item.stock ?? ''),
          title: item.title ?? '',
        })
        setLoadError(null)
      })
      .catch((error) => active && setLoadError(error.message))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [id, isEdit])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload = {
      category: form.category.trim(),
      description: form.description.trim(),
      isActive: form.isActive === 'true',
      price: Number(form.price),
      stock: Number(form.stock),
      title: form.title.trim(),
    }

    setSaving(true)
    try {
      if (isEdit) {
        const response = await adminApi.updateProduct(id, payload)
        setProduct(response.data)
        toast.success('Product updated')
      } else {
        const response = await adminApi.createProduct(payload)
        toast.success('Product created')
        navigate(`/admin/products/${response.data._id}/edit`, { replace: true })
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner label="Loading product…" />
  if (loadError) return <ErrorState message={loadError} onRetry={() => navigate(0)} />

  return (
    <section>
      <PageHeader
        actions={
          <Button to="/admin/products" variant="secondary">
            <ArrowLeft size={18} /> Back to products
          </Button>
        }
        eyebrow="Admin products"
        title={isEdit ? `Edit ${product?.title ?? 'product'}` : 'Create product'}
        description={
          isEdit
            ? 'Changes apply immediately. The slug is regenerated from the title by the backend.'
            : 'Create the product first, then upload images from the edit screen.'
        }
      />

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-4">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <Field
              error={errors.title}
              label="Title"
              name="title"
              onChange={handleChange}
              placeholder="Aero Knit Runner"
              value={form.title}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                error={errors.category}
                hint="Stored lowercase by the backend."
                label="Category"
                name="category"
                onChange={handleChange}
                placeholder="footwear"
                value={form.category}
              />
              <Field
                as="select"
                label="Visibility"
                name="isActive"
                onChange={handleChange}
                options={[
                  { label: 'Active — visible in the store', value: 'true' },
                  { label: 'Inactive — hidden', value: 'false' },
                ]}
                value={form.isActive}
              />
              <Field
                error={errors.price}
                hint={form.price ? formatAmount(Number(form.price)) : 'Rupees, e.g. 7499'}
                label="Price"
                min="0"
                name="price"
                onChange={handleChange}
                placeholder="7499"
                step="0.01"
                type="number"
                value={form.price}
              />
              <Field
                error={errors.stock}
                label="Stock"
                min="0"
                name="stock"
                onChange={handleChange}
                placeholder="20"
                step="1"
                type="number"
                value={form.stock}
              />
            </div>
            <Field
              as="textarea"
              error={errors.description}
              label="Description"
              name="description"
              onChange={handleChange}
              placeholder="At least 10 characters describing the product."
              value={form.description}
            />
            <div className="flex gap-2">
              <Button disabled={saving} type="submit">
                {saving ? 'Saving…' : isEdit ? 'Save product' : 'Create product'}
              </Button>
              <Button onClick={() => navigate('/admin/products')} variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {isEdit && product ? (
          <ImageManager onChange={setProduct} product={product} />
        ) : (
          <Card className="h-fit p-4">
            <PageHeader eyebrow="Media" title="Product images" />
            <p className="mt-2 text-sm text-neutral-500">
              Image uploads unlock once the product exists. Save the product to continue.
            </p>
          </Card>
        )}
      </div>
    </section>
  )
}
