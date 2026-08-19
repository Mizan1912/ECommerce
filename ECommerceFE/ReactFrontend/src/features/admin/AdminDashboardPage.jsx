import { Boxes, Package, ReceiptText, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { adminOrders, adminProducts, adminUsers } from '../../fixtures/admin'

export function AdminDashboardPage() {
  return (
    <section>
      <PageHeader
        actions={<Button to="/admin/products/new">Create product</Button>}
        eyebrow="Admin"
        title="Operations dashboard"
        description="Admin preview is role-gated through the session placeholder. Replace fixture metrics with admin APIs after backend integration."
      />
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <StatCard detail="GET /products or admin list" label="Products" value={adminProducts.length} />
        <StatCard detail="GET /admin/orders" label="Orders" value={adminOrders.length} />
        <StatCard detail="GET /admin/users" label="Users" value={adminUsers.length} />
        <StatCard detail="PATCH stock endpoint" label="Stock alerts" value="0" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          [Package, 'Product management', 'Create, edit, deactivate, and upload images for catalogue products.', '/admin/products'],
          [Boxes, 'Inventory', 'Adjust stock with reason fields and audit-ready UI.', '/admin/inventory'],
          [ReceiptText, 'Fulfillment', 'Track order state transitions from paid to delivered.', '/admin/orders'],
          [Users, 'Users', 'Review users, active status, and role changes.', '/admin/users'],
        ].map(([Icon, title, text, to]) => (
          <Button className="h-auto justify-start p-4 text-left" key={title} to={to} variant="secondary">
            <Icon className="shrink-0 text-emerald-700" size={22} />
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="mt-1 block text-sm font-normal text-neutral-500">{text}</span>
            </span>
          </Button>
        ))}
      </div>
    </section>
  )
}
