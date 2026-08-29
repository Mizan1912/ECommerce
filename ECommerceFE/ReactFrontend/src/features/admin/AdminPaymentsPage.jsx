import { Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { PAGE_SIZE, PAYMENT_STATUSES, PAYMENT_STATUS_TONE } from '../../lib/adminConstants'
import { formatAmount, formatDateTime } from '../../lib/formatters'
import { useAdminQuery } from '../../lib/useAdminQuery'

export function AdminPaymentsPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ q: '', status: '' })
  const [page, setPage] = useState(1)

  const { data, error, loading, meta, refetch } = useAdminQuery(
    () =>
      adminApi.listPayments({
        limit: PAGE_SIZE,
        page,
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      }),
    [filters.q, filters.status, page],
  )

  const applySearch = (event) => {
    event.preventDefault()
    setPage(1)
    setFilters((prev) => ({ ...prev, q: search.trim() }))
  }

  return (
    <section>
      <PageHeader
        eyebrow="Payments"
        title="Payment ledger"
        description="Razorpay attempts recorded by the backend. Status transitions are driven by verified webhooks, so this view is read-only."
      />

      <Card className="mt-5 p-4">
        <form className="grid gap-3 md:grid-cols-[1fr_200px_auto] md:items-end" onSubmit={applySearch}>
          <Field
            label="Search"
            name="q"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order number or provider id"
            value={search}
          />
          <Field
            as="select"
            label="Status"
            name="status"
            onChange={(event) => {
              setPage(1)
              setFilters((prev) => ({ ...prev, status: event.target.value }))
            }}
            options={[
              { label: 'All statuses', value: '' },
              ...PAYMENT_STATUSES.map((status) => ({ label: status, value: status })),
            ]}
            value={filters.status}
          />
          <Button type="submit" variant="secondary">
            <Search size={16} /> Search
          </Button>
        </form>
      </Card>

      <div className="mt-5">
        {loading ? (
          <Spinner label="Loading payments…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <>
            <Table
              columns={['Order', 'Customer', 'Provider', 'Provider ids', 'Amount', 'Status', 'Created']}
              empty="No payments recorded yet."
              rows={data ?? []}
              renderRow={(payment) => (
                <tr key={payment._id}>
                  <td className="px-4 py-3">
                    {payment.order?.orderNumber ? (
                      <Link className="font-medium hover:underline" to={`/admin/orders/${payment.order.orderNumber}`}>
                        {payment.order.orderNumber}
                      </Link>
                    ) : (
                      <span className="text-neutral-400">Order removed</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    <span className="block">{payment.order?.user?.name ?? '—'}</span>
                    <span className="block text-xs">{payment.order?.user?.email}</span>
                  </td>
                  <td className="px-4 py-3">{payment.provider}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    <span className="block">order: {payment.providerOrderId ?? '—'}</span>
                    <span className="block">payment: {payment.providerPaymentId ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">{formatAmount(payment.amount)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{formatDateTime(payment.createdAt)}</td>
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
