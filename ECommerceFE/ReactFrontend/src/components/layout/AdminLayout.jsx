import { BarChart3, Boxes, ImageUp, Package, ReceiptText, Users, WalletCards } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Notice } from '../ui/Notice'
import { useApp } from '../../lib/appContext'

const adminNav = [
  { icon: BarChart3, label: 'Dashboard', to: '/admin' },
  { icon: Package, label: 'Products', to: '/admin/products' },
  { icon: Boxes, label: 'Inventory', to: '/admin/inventory' },
  { icon: ReceiptText, label: 'Orders', to: '/admin/orders' },
  { icon: Users, label: 'Users', to: '/admin/users' },
  { icon: ImageUp, label: 'Uploads', to: '/admin/uploads' },
  { icon: WalletCards, label: 'Payments', to: '/admin/payments' },
]

export function AdminLayout() {
  const { session, signOut } = useApp()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = (session?.name ?? 'AD')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-neutral-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex h-16 items-center justify-between px-4">
            <NavLink className="flex items-center gap-2 font-semibold" to="/admin">
              <span className="grid size-9 place-items-center rounded-lg bg-neutral-950 text-sm text-white">AD</span>
              Admin
            </NavLink>
            <Button to="/" variant="ghost">
              Store
            </Button>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:grid lg:overflow-visible">
            {adminNav.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  className={({ isActive }) =>
                    `flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'}`
                  }
                  end={item.to === '/admin'}
                  key={item.to}
                  to={item.to}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>
        <div>
          <header className="flex h-16 items-center justify-end gap-4 border-b border-neutral-200 bg-white px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                {initials}
              </span>
              <span className="hidden text-sm leading-tight sm:block">
                <span className="block font-medium">{session?.name}</span>
                <span className="block text-xs text-neutral-500">{session?.email}</span>
              </span>
            </div>
            <Button onClick={handleSignOut} variant="secondary">
              Sign out
            </Button>
          </header>
          <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <Notice />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
