import { AlertTriangle, Boxes, IndianRupee, Package, ReceiptText, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { StatCard } from '../../components/ui/StatCard'
import { Table } from '../../components/ui/Table'
import { adminApi } from '../../lib/api/client'
import { ORDER_STATUS_TONE } from '../../lib/adminConstants'
import { formatAmount, formatDate, formatNumber } from '../../lib/formatters'
import { useAdminQuery } from '../../lib/useAdminQuery'

function SalesTrend({ points }) {
  if (!points?.length) {
    return <p className="py-8 text-center text-sm text-neutral-500">No orders in the last 30 days.</p>
  }

  const max = Math.max(...points.map((point) => point.revenue), 1)

  return (
    <div className="flex h-40 items-end gap-1 overflow-x-auto pt-4">
      {points.map((point) => (
        <div className="flex min-w-6 flex-1 flex-col items-center gap-2" key={point._id} title={`${point._id}: ${formatAmount(point.revenue)} · ${point.orders} orders`}>
          <div
            className="w-full rounded-t bg-emerald-500/80"
            style={{ height: `${Math.max(4, (point.revenue / max) * 120)}px` }}
          />
          <span className="text-[10px] text-neutral-500">{point._id.slice(5)}</span>
        </div>
      ))}
    </div>
  )
}

export function AdminDashboardPage() {
  const { data, error, loading, refetch } = useAdminQuery(() => adminApi.stats(), [])

  if (loading) return <Spinner label="Loading dashboard…" />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const { orders, payments, products, recentOrders, revenue, salesTrend, topProducts, users } = data

  return (
    <section>
      <PageHeader
        actions={<Button to="/admin/products/new">Create product</Button>}
        eyebrow="Admin"
        title="Operations dashboard"
        description="Live metrics from the store database — revenue, fulfillment queue, inventory health, and customer growth."
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          detail={`${formatAmount(revenue.last30Days)} in the last 30 days`}
          label="Revenue (paid)"
          value={formatAmount(revenue.total)}
        />
        <StatCard
          detail={`${orders.awaitingFulfillment} awaiting fulfillment · ${orders.pending} pending payment`}
          label="Orders"
          value={formatNumber(orders.total)}
        />
        <StatCard
          detail={`${products.active} active · ${products.outOfStock} out of stock`}
          label="Products"
          value={formatNumber(products.total)}
        />
        <StatCard
          detail={`${users.newLast30Days} joined in the last 30 days`}
          label="Users"
          value={formatNumber(users.total)}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Last 30 days</p>
              <h2 className="mt-1 text-xl font-semibold">Revenue trend</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <IndianRupee size={16} />
              Avg order {formatAmount(revenue.averageOrderValue)}
            </div>
          </div>
          <SalesTrend points={salesTrend} />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-600" size={18} />
            <h2 className="text-lg font-semibold">Low stock</h2>
          </div>
          <p className="mt-1 text-xs text-neutral-500">At or below {products.lowStockThreshold} units.</p>
          <ul className="mt-3 grid gap-2">
            {products.lowStock.length === 0 ? (
              <li className="py-6 text-center text-sm text-neutral-500">Inventory looks healthy.</li>
            ) : (
              products.lowStock.map((product) => (
                <li className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2" key={product._id}>
                  <Link className="truncate text-sm font-medium hover:underline" to={`/admin/products/${product._id}/edit`}>
                    {product.title}
                  </Link>
                  <Badge tone={product.stock === 0 ? 'red' : 'amber'}>{product.stock} left</Badge>
                </li>
              ))
            )}
          </ul>
          <Button className="mt-4 w-full" to="/admin/inventory" variant="secondary">
            Manage inventory
          </Button>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <div className="mt-3">
            <Table
              columns={['Order', 'Customer', 'Status', 'Total']}
              empty="No orders yet."
              rows={recentOrders}
              renderRow={(order) => (
                <tr key={order._id}>
                  <td className="px-4 py-3">
                    <Link className="font-medium hover:underline" to={`/admin/orders/${order.orderNumber}`}>
                      {order.orderNumber}
                    </Link>
                    <span className="block text-xs text-neutral-500">{formatDate(order.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{order.user?.name ?? 'Deleted user'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={ORDER_STATUS_TONE[order.status]}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatAmount(order.totalAmount)}</td>
                </tr>
              )}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold">Best sellers</h2>
          <div className="mt-3">
            <Table
              columns={['Product', 'Units', 'Revenue']}
              empty="No paid orders yet."
              rows={topProducts}
              renderRow={(product) => (
                <tr key={product._id}>
                  <td className="px-4 py-3 font-medium">{product.title}</td>
                  <td className="px-4 py-3">{formatNumber(product.quantity)}</td>
                  <td className="px-4 py-3">{formatAmount(product.revenue)}</td>
                </tr>
              )}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {Object.entries(payments).map(([status, value]) => (
              <div className="rounded-lg border border-neutral-200 px-3 py-2" key={status}>
                <p className="text-xs uppercase tracking-wide text-neutral-500">{status}</p>
                <p className="font-semibold">{value.count}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          [Package, 'Products', 'Create, edit, deactivate, and manage catalogue images.', '/admin/products'],
          [Boxes, 'Inventory', 'Restock, correct counts, and clear out-of-stock items.', '/admin/inventory'],
          [ReceiptText, 'Fulfillment', 'Move orders from paid through to delivered.', '/admin/orders'],
          [Users, 'Users', 'Review customers, change roles, deactivate accounts.', '/admin/users'],
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
