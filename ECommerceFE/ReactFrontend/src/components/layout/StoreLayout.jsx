import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Notice } from '../ui/Notice'
import { useApp } from '../../lib/appContext'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Orders', to: '/orders' },
]

export function StoreLayout() {
  const { cartItems, session } = useApp()
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink className="flex items-center gap-2 font-semibold" to="/">
            <span className="grid size-9 place-items-center rounded-lg bg-neutral-950 text-sm text-white">EC</span>
            <span>Ecommercely</span>
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-neutral-100 text-neutral-950' : 'text-neutral-600 hover:text-neutral-950'}`
                }
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button className="hidden px-3 sm:inline-flex" to="/products" variant="ghost">
              <Search size={18} />
            </Button>
            <Button className="hidden px-3 sm:inline-flex" variant="ghost">
              <Heart size={18} />
            </Button>
            <Button className="relative px-3" to="/cart" variant="ghost">
              <ShoppingBag size={18} />
              {cartCount ? (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Button>
            <Button className="px-3" to={session ? '/account' : '/login'} variant="secondary">
              <User size={18} />
              <span className="hidden sm:inline">{session ? session.name : 'Login'}</span>
            </Button>
            <Button className="px-3 md:hidden" variant="ghost">
              <Menu size={18} />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Notice />
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-neutral-500 sm:px-6 md:grid-cols-3 lg:px-8">
          <p>Modern MERN commerce frontend prepared for the backend contract.</p>
          <p>Public catalogue, authenticated cart, checkout, orders, and account surfaces.</p>
          <p>API calls are intentionally disabled until integration.</p>
        </div>
      </footer>
    </div>
  )
}
