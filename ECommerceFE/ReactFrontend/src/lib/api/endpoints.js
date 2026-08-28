export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const endpoints = {
  auth: {
    forgotPassword: 'POST /auth/forgot-password',
    login: 'POST /auth/login',
    logout: 'POST /auth/logout',
    me: 'GET /auth/me',
    mfaSetup: 'POST /auth/mfa/setup',
    mfaVerify: 'POST /auth/mfa/verify',
    refresh: 'POST /auth/refresh',
    register: 'POST /auth/register',
    resetPassword: 'POST /auth/reset-password',
    verifyEmail: 'POST /auth/verify-email',
  },
  products: {
    detail: 'GET /products/:slug',
    list: 'GET /products',
  },
  cart: {
    addItem: 'POST /cart/items',
    clear: 'DELETE /cart',
    get: 'GET /cart',
    removeItem: 'DELETE /cart/items/:productId',
    updateItem: 'PATCH /cart/items/:productId',
  },
  checkout: {
    create: 'POST /checkout',
  },
  orders: {
    detail: 'GET /orders/:id',
    list: 'GET /orders',
  },
  admin: {
    adjustStock: 'PATCH /admin/products/:id/stock',
    createProduct: 'POST /admin/products',
    deleteImage: 'DELETE /admin/products/:id/images/:imageId',
    deleteProduct: 'DELETE /admin/products/:id',
    deleteUser: 'DELETE /admin/users/:id',
    order: 'GET /admin/orders/:id',
    orders: 'GET /admin/orders',
    payments: 'GET /admin/payments',
    product: 'GET /admin/products/:id',
    products: 'GET /admin/products',
    setPrimaryImage: 'PATCH /admin/products/:id/images/:imageId/primary',
    stats: 'GET /admin/stats',
    updateOrderStatus: 'PATCH /admin/orders/:id/status',
    updateProduct: 'PATCH /admin/products/:id',
    updateUser: 'PATCH /admin/users/:id',
    uploadImages: 'POST /admin/products/:id/images',
    user: 'GET /admin/users/:id',
    users: 'GET /admin/users',
  },
  payments: {
    webhook: 'POST /payments/webhook',
  },
}
