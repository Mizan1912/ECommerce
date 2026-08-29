import { Search, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ErrorState } from '../../components/ui/ErrorState'
import { Field } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { Table } from '../../components/ui/Table'
import { adminApi } from '../../lib/api/client'
import { PAGE_SIZE } from '../../lib/adminConstants'
import { formatAmount, formatDate } from '../../lib/formatters'
import { useAdminQuery } from '../../lib/useAdminQuery'
import { useApp } from '../../lib/appContext'

// Mounted with a per-user key so the form state starts from the selected user.
function EditUserModal({ onClose, onSaved, user }) {
  const [form, setForm] = useState({
    isActive: String(user?.isActive !== false),
    name: user?.name ?? '',
    role: user?.role ?? 'customer',
  })
  const [detail, setDetail] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return undefined

    let active = true
    adminApi
      .getUser(user._id)
      .then((response) => active && setDetail(response.data))
      .catch(() => active && setDetail(null))

    return () => {
      active = false
    }
  }, [user])

  const save = async () => {
    setSaving(true)
    try {
      await adminApi.updateUser(user._id, {
        isActive: form.isActive === 'true',
        name: form.name.trim(),
        role: form.role,
      })
      toast.success('User updated')
      onSaved()
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      onClose={onClose}
      open={Boolean(user)}
      title={`Edit ${user?.name ?? 'user'}`}
      footer={
        <>
          <Button disabled={saving} onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field
          label="Name"
          name="name"
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          value={form.name}
        />
        <Field disabled label="Email" name="email" value={user?.email ?? ''} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            as="select"
            label="Role"
            name="role"
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            options={[
              { label: 'Customer', value: 'customer' },
              { label: 'Admin', value: 'admin' },
            ]}
            value={form.role}
          />
          <Field
            as="select"
            label="Account status"
            name="isActive"
            onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.value }))}
            options={[
              { label: 'Active', value: 'true' },
              { label: 'Deactivated — cannot log in', value: 'false' },
            ]}
            value={form.isActive}
          />
        </div>
        {detail ? (
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Orders</p>
              <p className="font-semibold">{detail.stats.orderCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Total spent</p>
              <p className="font-semibold">{formatAmount(detail.stats.totalSpent)}</p>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}

export function AdminUsersPage() {
  const { session } = useApp()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [filters, setFilters] = useState({ isActive: '', q: searchParams.get('q') ?? '', role: '' })
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, error, loading, meta, refetch } = useAdminQuery(
    () =>
      adminApi.listUsers({
        limit: PAGE_SIZE,
        page,
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.isActive ? { isActive: filters.isActive } : {}),
      }),
    [filters.q, filters.role, filters.isActive, page],
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

  const toggleActive = async (user) => {
    try {
      await adminApi.updateUser(user._id, { isActive: user.isActive === false })
      toast.success(`${user.name} ${user.isActive === false ? 'reactivated' : 'deactivated'}`)
      refetch()
    } catch (requestError) {
      toast.error(requestError.message)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setBusy(true)
    try {
      await adminApi.deleteUser(pendingDelete._id)
      toast.success('User deleted')
      setPendingDelete(null)
      refetch()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Promote customers to admin, deactivate accounts to block sign-in, or remove users who have never ordered."
      />

      <Card className="mt-5 p-4">
        <form className="grid gap-3 md:grid-cols-[1fr_180px_200px_auto] md:items-end" onSubmit={applySearch}>
          <Field
            label="Search"
            name="q"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or email"
            value={search}
          />
          <Field
            as="select"
            label="Role"
            name="role"
            onChange={(event) => updateFilter('role', event.target.value)}
            options={[
              { label: 'All roles', value: '' },
              { label: 'Customer', value: 'customer' },
              { label: 'Admin', value: 'admin' },
            ]}
            value={filters.role}
          />
          <Field
            as="select"
            label="Status"
            name="isActive"
            onChange={(event) => updateFilter('isActive', event.target.value)}
            options={[
              { label: 'All accounts', value: '' },
              { label: 'Active', value: 'true' },
              { label: 'Deactivated', value: 'false' },
            ]}
            value={filters.isActive}
          />
          <Button type="submit" variant="secondary">
            <Search size={16} /> Search
          </Button>
        </form>
      </Card>

      <div className="mt-5">
        {loading ? (
          <Spinner label="Loading users…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <>
            <Table
              columns={['Name', 'Email', 'Role', 'Status', 'Joined', '']}
              empty="No users match these filters."
              rows={data ?? []}
              renderRow={(user) => {
                const isSelf = session?.id === user._id

                return (
                  <tr key={user._id}>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-medium">
                        {user.role === 'admin' ? (
                          <ShieldCheck className="text-emerald-700" size={16} />
                        ) : (
                          <UserRound className="text-neutral-400" size={16} />
                        )}
                        {user.name}
                        {isSelf ? <span className="text-xs font-normal text-neutral-400">(you)</span> : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={user.role === 'admin' ? 'blue' : 'default'}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={user.isActive === false ? 'red' : 'green'}>
                        {user.isActive === false ? 'Deactivated' : 'Active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => setEditing(user)} variant="secondary">
                          Edit
                        </Button>
                        <Button disabled={isSelf} onClick={() => toggleActive(user)} variant="secondary">
                          {user.isActive === false ? 'Activate' : 'Deactivate'}
                        </Button>
                        <Button
                          className="px-3"
                          disabled={isSelf}
                          onClick={() => setPendingDelete(user)}
                          variant="secondary"
                        >
                          <Trash2 className="text-red-600" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              }}
            />
            <Pagination onPageChange={setPage} pagination={meta?.pagination} />
          </>
        )}
      </div>

      {editing ? (
        <EditUserModal key={editing._id} onClose={() => setEditing(null)} onSaved={refetch} user={editing} />
      ) : null}

      <ConfirmDialog
        busy={busy}
        confirmLabel="Delete user"
        description={`${pendingDelete?.email} will be removed permanently. Users with existing orders cannot be deleted — deactivate them instead.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        open={Boolean(pendingDelete)}
        title="Delete user?"
      />
    </section>
  )
}
