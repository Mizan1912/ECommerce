import { Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './lib/AppProvider'
import { useApp } from './lib/appContext'
import { AdminLayout } from './components/layout/AdminLayout'
import { StoreLayout } from './components/layout/StoreLayout'
import { AccountPage } from './features/account/AccountPage'
import { AdminDashboardPage } from './features/admin/AdminDashboardPage'
import { AdminInventoryPage } from './features/admin/AdminInventoryPage'
import { AdminOrdersPage } from './features/admin/AdminOrdersPage'
import { AdminPaymentsPage } from './features/admin/AdminPaymentsPage'
import { AdminProductEditorPage } from './features/admin/AdminProductEditorPage'
import { AdminProductsPage } from './features/admin/AdminProductsPage'
import { AdminUploadsPage } from './features/admin/AdminUploadsPage'
import { AdminUsersPage } from './features/admin/AdminUsersPage'
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage'
import { LoginPage } from './features/auth/LoginPage'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage'
import { CartPage } from './features/cart/CartPage'
import { CheckoutPage } from './features/cart/CheckoutPage'
import { HomePage } from './features/products/HomePage'
import { ProductDetailPage } from './features/products/ProductDetailPage'
import { ProductsPage } from './features/products/ProductsPage'
import { OrderDetailPage } from './features/orders/OrderDetailPage'
import { OrdersPage } from './features/orders/OrdersPage'
import './App.css'

function AdminGate({ children }) {
  const { session } = useApp()

  if (session?.role !== 'admin') {
    return <Navigate replace to="/login?next=/admin" />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route
        path="admin"
        element={
          <AdminGate>
            <AdminLayout />
          </AdminGate>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductEditorPage mode="create" />} />
        <Route path="products/:id/edit" element={<AdminProductEditorPage mode="edit" />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="uploads" element={<AdminUploadsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}

export default App
