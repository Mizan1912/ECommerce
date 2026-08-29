import { Eye, Search } from 'lucide-react'
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
import { Table } from '../../components/ui/Table'
import { adminApi } from '../../lib/api/client'
import {
  ORDER_STATUSES,
  ORDER_STATUS_TONE,
  ORDER_TRANSITIONS,
  PAGE_SIZE,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_TONE,
} from '../../lib/adminConstants'
import { formatAmount, formatDateTime } from '../../lib/formatters'
import { useAdminQuery } from '../../lib/useAdminQuery'

function StatusControl({ onUpdated, order }) {
  const [busy, setBusy] = useState(false)
  const transitions = ORDER_TRANSITIONS[order.status] ?? []

  if (transitions.length === 0) {
    return <span className="text-xs text-neutral-400">Final state</span>
  }

  const change = async (event) => {
    const status = event.target.value
    if (!status) return

    setBusy(true)
    try {
      await adminApi.updateOrderStatus(order.orderNumber, status)
      toast.success(`${order.orderNumber} moved to ${status}`)
      onUpdated()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <select
      aria-label={`Change status for ${order.orderNumber}`}
      className="min-h-10 rounded-lg border border-neutral-200 bg-white px-2 text-sm"
      disabled={busy}
      onChange={change}
      value=""
    >
      <option value="">{busy ? 'Updating…' : 'Move to…'}</option>
      {transitions.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  )
}

export function AdminOrdersPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ paymentStatus: '', q: '', status: '' })
  const [page, setPage] = useState(1)

  const { data, error, loading, meta, refetch } = useAdminQuery(
    () =>
      adminApi.listOrders({
        limit: PAGE_SIZE,
        page,
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
      }),
    [filters.q, filters.status, filters.paymentStatus, page],
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

  return (
    <section>
      <PageHeader
        eyebrow="Admin"
        title="Orders"
        description="Status changes follow the backend state machine: pending → paid → processing → shipped → delivered. Cancelling restores stock."
      />

      <Card className="mt-5 p-4">
        <form className="grid gap-3 md:grid-cols-[1fr_200px_200px_auto] md:items-end" onSubmit={applySearch}>
          <Field
            label="Search"
            name="q"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order number"
            value={search}
          />
          <Field
            as="select"
            label="Order status"
            name="status"
            onChange={(event) => updateFilter('status', event.target.value)}
            options={[{ label: 'All statuses', value: '' }, ...ORDER_STATUSES.map((s) => ({ label: s, value: s }))]}
            value={filters.status}
          />
          <Field
            as="select"
            label="Payment status"
            name="paymentStatus"
            onChange={(event) => updateFilter('paymentStatus', event.target.value)}
            options={[{ label: 'All payments', value: '' }, ...PAYMENT_STATUSES.map((s) => ({ label: s, value: s }))]}
            value={filters.paymentStatus}
          />
          <Button type="submit" variant="secondary">
            <Search size={16} /> Search
          </Button>
        </form>
      </Card>

      <div className="mt-5">
        {loading ? (
          <Spinner label="Loading orders…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <>
            <Table
              columns={['Order', 'Customer', 'Status', 'Payment', 'Total', 'Placed', '']}
              empty="No orders match these filters."
              rows={data ?? []}
              renderRow={(order) => (
                <tr key={order._id}>
                  <td className="px-4 py-3">
                    <Link className="font-medium hover:underline" to={`/admin/orders/${order.orderNumber}`}>
                      {order.orderNumber}
                    </Link>
                    <span className="block text-xs text-neutral-500">{order.items?.length ?? 0} item(s)</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    <span className="block">{order.user?.name ?? 'Deleted user'}</span>
                    <span className="block text-xs">{order.user?.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ORDER_STATUS_TONE[order.status]}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>{order.paymentStatus}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatAmount(order.totalAmount)}</td>
                  <td className="px-4 py-3 text-neutral-500">{formatDateTime(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <StatusControl onUpdated={refetch} order={order} />
                      <Button className="px-3" to={`/admin/orders/${order.orderNumber}`} variant="secondary">
                        <Eye size={16} />
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
    </section>
  )
}
