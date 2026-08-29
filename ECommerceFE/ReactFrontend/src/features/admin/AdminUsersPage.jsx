import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageHeader } from '../../components/ui/PageHeader'
import { Table } from '../../components/ui/Table'
import { adminUsers } from '../../fixtures/admin'
import { useApp } from '../../lib/appContext'

export function AdminUsersPage() {
  const { showApiNotice } = useApp()

  return (
    <section>
      <PageHeader eyebrow="Admin" title="Users" description="User role and active state changes connect to PATCH /admin/users/:id." />
      <div className="mt-5">
        <Table
          columns={['Name', 'Email', 'Role', 'Status', '']}
          rows={adminUsers}
          renderRow={(user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 font-medium">{user.name}</td>
              <td className="px-4 py-3 text-neutral-500">{user.email}</td>
              <td className="px-4 py-3"><Badge tone={user.role === 'admin' ? 'blue' : 'default'}>{user.role}</Badge></td>
              <td className="px-4 py-3">{user.status}</td>
              <td className="px-4 py-3 text-right">
                <Button onClick={() => showApiNotice('adminApi.updateUser')} variant="secondary">
                  Edit
                </Button>
              </td>
            </tr>
          )}
        />
      </div>
    </section>
  )
}
