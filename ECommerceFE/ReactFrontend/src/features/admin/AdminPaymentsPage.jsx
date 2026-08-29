import { Badge } from '../../components/ui/Badge'
import { PageHeader } from '../../components/ui/PageHeader'
import { Table } from '../../components/ui/Table'
import { paymentEvents } from '../../fixtures/admin'

export function AdminPaymentsPage() {
  return (
    <section>
      <PageHeader eyebrow="Payments" title="Webhook monitor" description="Backend owns webhook verification. This UI can display event processing status after integration." />
      <div className="mt-5">
        <Table
          columns={['Event', 'Order', 'Status']}
          rows={paymentEvents}
          renderRow={(event) => (
            <tr key={event.id}>
              <td className="px-4 py-3 font-medium">{event.event}</td>
              <td className="px-4 py-3 text-neutral-500">{event.orderNumber}</td>
              <td className="px-4 py-3"><Badge tone={event.status === 'processed' ? 'green' : 'amber'}>{event.status}</Badge></td>
            </tr>
          )}
        />
      </div>
    </section>
  )
}
