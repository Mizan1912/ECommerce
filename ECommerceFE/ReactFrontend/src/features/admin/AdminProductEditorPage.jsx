import { useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { adminProducts } from '../../fixtures/admin'
import { useApp } from '../../lib/appContext'

export function AdminProductEditorPage({ mode }) {
  const { id } = useParams()
  const { showApiNotice } = useApp()
  const product = adminProducts.find((item) => item.id === id)
  const isEdit = mode === 'edit'

  return (
    <section>
      <PageHeader eyebrow="Admin products" title={isEdit ? `Edit ${product?.title ?? 'product'}` : 'Create product'} />
      <Card className="mt-5 p-4">
        <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="SKU" name="sku" placeholder={product?.sku ?? 'SKU-001'} />
            <Field label="Slug" name="slug" placeholder={product?.slug ?? 'product-slug'} />
            <Field label="Title" name="title" placeholder={product?.title ?? 'Product title'} />
            <Field label="Category" name="category" placeholder={product?.category ?? 'Category'} />
            <Field label="Price minor units" name="priceMinor" placeholder={String(product?.priceMinor ?? 129900)} />
            <Field label="Currency" name="currency" placeholder={product?.currency ?? 'INR'} />
          </div>
          <Field as="textarea" label="Description" name="description" placeholder={product?.description ?? 'Product details'} />
          <Button onClick={() => showApiNotice(isEdit ? 'adminApi.updateProduct' : 'adminApi.createProduct')}>
            {isEdit ? 'Save product' : 'Create product'}
          </Button>
        </form>
      </Card>
    </section>
  )
}
