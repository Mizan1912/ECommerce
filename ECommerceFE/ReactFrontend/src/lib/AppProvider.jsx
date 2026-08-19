import { useMemo, useState } from 'react'
import { cartFixtures } from '../fixtures/cart'
import { AppContext } from './appContext'

export function AppProvider({ children }) {
  const [session, setSession] = useState(null)
  const [cartItems, setCartItems] = useState(cartFixtures)
  const [notice, setNotice] = useState('')

  const value = useMemo(
    () => ({
      cartItems,
      clearNotice: () => setNotice(''),
      notice,
      previewLogin: (role) =>
        setSession({
          id: role === 'admin' ? 'admin-preview' : 'customer-preview',
          name: role === 'admin' ? 'Admin Preview' : 'Customer Preview',
          email: role === 'admin' ? 'admin@example.com' : 'customer@example.com',
          role,
          isPreview: true,
        }),
      removeCartItem: (productId) => setCartItems((items) => items.filter((item) => item.product.id !== productId)),
      session,
      setCartItems,
      showApiNotice: (action) =>
        setNotice(`${action} is ready for API integration. No network request was sent.`),
      signOut: () => setSession(null),
      updateCartQuantity: (productId, quantity) =>
        setCartItems((items) =>
          items.map((item) => (item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item)),
        ),
    }),
    [cartItems, notice, session],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
