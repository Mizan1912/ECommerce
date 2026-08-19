export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const apiEndpoints = {
  auth: {
    register: 'POST /auth/register',
    login: 'POST /auth/login',
    refresh: 'POST /auth/refresh',
    logout: 'POST /auth/logout',
    forgotPassword: 'POST /auth/forgot-password',
    resetPassword: 'POST /auth/reset-password',
    verifyEmail: 'POST /auth/verify-email',
    me: 'GET /auth/me',
    mfaSetup: 'POST /auth/mfa/setup',
    mfaVerify: 'POST /auth/mfa/verify',
  },
  users: {
    me: 'GET /users/me',
    updateMe: 'PATCH /users/me',
  },
  products: {
    list: 'GET /products',
    detail: 'GET /products/:slug',
  },
  cart: {
    get: 'GET /cart',
    addItem: 'POST /cart/items',
    updateItem: 'PATCH /cart/items/:productId',
    removeItem: 'DELETE /cart/items/:productId',
    clear: 'DELETE /cart',
  },
  checkout: {
    create: 'POST /checkout',
  },
  orders: {
    list: 'GET /orders',
    detail: 'GET /orders/:id',
  },
  admin: {
    users: 'GET /admin/users',
    updateUser: 'PATCH /admin/users/:id',
    createProduct: 'POST /admin/products',
    updateProduct: 'PATCH /admin/products/:id',
    deleteProduct: 'DELETE /admin/products/:id',
    adjustStock: 'PATCH /admin/products/:id/stock',
    uploadImages: 'POST /admin/products/:id/images',
    deleteImage: 'DELETE /admin/products/:id/images/:imageId',
    orders: 'GET /admin/orders',
    updateOrderStatus: 'PATCH /admin/orders/:id/status',
  },
  payments: {
    webhook: 'POST /payments/webhook',
  },
}

export const initialApiState = {
  session: null,
  products: [],
  cart: null,
  orders: [],
  adminUsers: [],
  adminOrders: [],
  adminProducts: [],
  paymentEvents: [],
}

export function connectApiHere(actionName) {
  // TODO(api-integration): Replace this with the real request after the backend is ready.
  // Keep response parsing aligned with the backend envelope:
  // success: { success: true, data, meta }
  // error: { success: false, error: { code, message, details } }
  return {
    ok: false,
    message: `${actionName} is waiting for API integration at ${API_BASE_URL}.`,
  }
}
