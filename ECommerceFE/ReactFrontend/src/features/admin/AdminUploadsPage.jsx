import { Upload } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { useApp } from '../../lib/appContext'

export function AdminUploadsPage() {
  const { showApiNotice } = useApp()

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit p-4">
        <PageHeader eyebrow="Images" title="Product uploads" />
        <form className="mt-5 grid gap-4" onSubmit={(event) => event.preventDefault()}>
          <Field label="Product ID" name="productId" placeholder="Product id" />
          <label className="grid min-h-40 place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-neutral-500">
            <input className="sr-only" disabled multiple type="file" />
            File input disabled until multipart API is connected.
          </label>
          <Button onClick={() => showApiNotice('adminApi.uploadProductImages')}>
            <Upload size={18} />
            Upload images
          </Button>
        </form>
      </Card>
      <Card className="p-4">
        <PageHeader eyebrow="Storage" title="Media library" description="Will show Cloudinary/S3 image references after POST /admin/products/:id/images is connected." />
      </Card>
    </section>
  )
}
