import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppProvider } from './lib/AppProvider'
import { useApp } from './lib/appContext'
import { AdminLayout } from './components/layout/AdminLayout'
import { StoreLayout } from './components/layout/StoreLayout'
import { AccountPage } from './features/account/AccountPage'
import { AdminDashboardPage } from './features/admin/AdminDashboardPage'
import { AdminInventoryPage } from './features/admin/AdminInventoryPage'
import { AdminOrderDetailPage } from './features/admin/AdminOrderDetailPage'
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
import  RegisterPage  from './features/auth/Register'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminGate({ children }) {
  const { session } = useApp()
  const location = useLocation()

  // Preview sessions carry no access token, so they cannot reach the admin API.
  if (session?.role !== 'admin' || session?.isPreview) {
    return <Navigate replace to={`/login?next=${encodeURIComponent(location.pathname)}`} />
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
        <Route path='register' element={<RegisterPage/>}/>
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
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
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
    <>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
      <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
        />
    </>
  )

}

export default App
