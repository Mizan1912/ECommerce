import { Edit, Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Table } from '../../components/ui/Table'
import { adminProducts } from '../../fixtures/admin'
import { formatMoney } from '../../lib/formatters'

export function AdminProductsPage() {
  return (
    <section>
      <PageHeader actions={<Button to="/admin/products/new"><Plus size={18} /> New product</Button>} eyebrow="Admin" title="Products" />
      <div className="mt-5">
        <Table
          columns={['Product', 'SKU', 'Price', 'Available', 'Status', '']}
          rows={adminProducts}
          renderRow={(product) => (
            <tr key={product.id}>
              <td className="px-4 py-3 font-medium">{product.title}</td>
              <td className="px-4 py-3 text-neutral-500">{product.sku}</td>
              <td className="px-4 py-3">{formatMoney(product.priceMinor, product.currency)}</td>
              <td className="px-4 py-3">{product.stock - product.reservedStock}</td>
              <td className="px-4 py-3">{product.isActive ? 'Active' : 'Inactive'}</td>
              <td className="px-4 py-3 text-right">
                <Button className="px-3" to={`/admin/products/${product.id}/edit`} variant="secondary">
                  <Edit size={16} />
                </Button>
              </td>
            </tr>
          )}
        />
      </div>
    </section>
  )
}
