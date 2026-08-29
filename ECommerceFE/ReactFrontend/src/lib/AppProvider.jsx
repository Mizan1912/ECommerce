import { useCallback, useMemo, useState } from 'react'
import { cartFixtures } from '../fixtures/cart'
import { AppContext } from './appContext'
import {
  authApi,
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  setStoredSession,
} from './api/client'

function toSession(user) {
  if (!user) return null

  return {
    id: user._id ?? user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive !== false,
  }
}

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => {
    const token = getStoredToken()
    const user = getStoredUser()
    return token && user ? toSession(user) : null
  })
  const [cartItems, setCartItems] = useState(cartFixtures)
  const [notice, setNotice] = useState('')

  const signIn = useCallback(async (credentials) => {
    const response = await authApi.login(credentials)
    const user = response?.data?.user
    const accessToken = response?.data?.accessToken

    setStoredSession(accessToken, user)
    const nextSession = toSession(user)
    setSession(nextSession)
    return nextSession
  }, [])

  const signOut = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Logging out locally matters more than the server round trip.
    }
    clearStoredSession()
    setSession(null)
  }, [])

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
      showNotice: setNotice,
      signIn,
      signOut,
      updateCartQuantity: (productId, quantity) =>
        setCartItems((items) =>
          items.map((item) => (item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item)),
        ),
    }),
    [cartItems, notice, session, signIn, signOut],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
