import { API_BASE_URL } from './endpoints'

function placeholder(action) {
  // TODO(api-integration): Replace this placeholder with fetch/axios after backend APIs are ready.
  // Expected backend envelopes:
  // success: { success: true, data, meta }
  // error: { success: false, error: { code, message, details } }
  return Promise.resolve({
    success: false,
    error: {
      code: 'API_NOT_CONNECTED',
      details: { baseUrl: API_BASE_URL },
      message: `${action} is waiting for API integration.`,
    },
  })
}

export const authApi = {
  forgotPassword: () => placeholder('authApi.forgotPassword'),
  login: () => placeholder('authApi.login'),
  resetPassword: () => placeholder('authApi.resetPassword'),
}

export const productsApi = {
  detail: () => placeholder('productsApi.detail'),
  list: () => placeholder('productsApi.list'),
}

export const cartApi = {
  addItem: () => placeholder('cartApi.addItem'),
  clear: () => placeholder('cartApi.clear'),
  removeItem: () => placeholder('cartApi.removeItem'),
  updateItem: () => placeholder('cartApi.updateItem'),
}

export const checkoutApi = {
  create: () => placeholder('checkoutApi.create'),
}

export const ordersApi = {
  detail: () => placeholder('ordersApi.detail'),
  list: () => placeholder('ordersApi.list'),
}

export const adminApi = {
  adjustStock: () => placeholder('adminApi.adjustStock'),
  createProduct: () => placeholder('adminApi.createProduct'),
  updateOrderStatus: () => placeholder('adminApi.updateOrderStatus'),
  updateProduct: () => placeholder('adminApi.updateProduct'),
  updateUser: () => placeholder('adminApi.updateUser'),
  uploadProductImages: () => placeholder('adminApi.uploadProductImages'),
}
