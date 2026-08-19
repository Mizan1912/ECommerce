import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Table } from '../../components/ui/Table'
import { adminProducts } from '../../fixtures/admin'
import { useApp } from '../../lib/appContext'

export function AdminInventoryPage() {
  const { showApiNotice } = useApp()

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit p-4">
        <PageHeader eyebrow="Stock" title="Adjust inventory" />
        <form className="mt-5 grid gap-4" onSubmit={(event) => event.preventDefault()}>
          <Field label="Product ID" name="productId" placeholder="Mongo product id" />
          <Field label="Delta" name="delta" placeholder="+50 or -2" />
          <Field label="Reason" name="reason" placeholder="restock, correction, damage" />
          <Button onClick={() => showApiNotice('adminApi.adjustStock')}>Adjust stock</Button>
        </form>
      </Card>
      <div>
        <PageHeader eyebrow="Inventory" title="Available stock" />
        <div className="mt-5">
          <Table
            columns={['Product', 'Stock', 'Reserved', 'Available']}
            rows={adminProducts}
            renderRow={(product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium">{product.title}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">{product.reservedStock}</td>
                <td className="px-4 py-3">{product.stock - product.reservedStock}</td>
              </tr>
            )}
          />
        </div>
      </div>
    </section>
  )
}
