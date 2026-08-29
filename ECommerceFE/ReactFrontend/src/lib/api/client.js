import axios from 'axios'
import { API_BASE_URL } from './endpoints'

export const TOKEN_STORAGE_KEY = 'ec.accessToken'
export const USER_STORAGE_KEY = 'ec.user'

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredSession(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } catch {
    // Storage can be unavailable (private mode); the in-memory session still works.
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Normalised error thrown by every api helper. */
export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details ?? []
  }
}

function toApiError(error) {
  const status = error.response?.status
  const payload = error.response?.data
  const details = payload?.errors ?? []
  const message =
    payload?.message ||
    details[0]?.message ||
    error.message ||
    'Something went wrong. Please try again.'

  if (status === 401) {
    clearStoredSession()
  }

  return new ApiError(message, { status, details })
}

async function request(config) {
  try {
    const response = await http.request(config)
    // Backend envelope: { success, message, data, meta }
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}

/* --------------------------------- auth ---------------------------------- */

export const authApi = {
  login: (payload) => request({ method: 'POST', url: '/auth/login', data: payload }),
  register: (payload) => request({ method: 'POST', url: '/auth/register', data: payload }),
  logout: () => request({ method: 'POST', url: '/auth/logout' }),
  refresh: () => request({ method: 'POST', url: '/auth/refresh' }),
  forgotPassword: (payload) => request({ method: 'POST', url: '/auth/forgot-password', data: payload }),
}

/* -------------------------------- storefront ------------------------------ */

export const productsApi = {
  list: (params) => request({ method: 'GET', url: '/products', params }),
  detail: (slug) => request({ method: 'GET', url: `/products/${slug}` }),
}

export const ordersApi = {
  list: () => request({ method: 'GET', url: '/orders' }),
  detail: (orderNumber) => request({ method: 'GET', url: `/orders/${orderNumber}` }),
}

/* ---------------------------------- admin --------------------------------- */

export const adminApi = {
  // dashboard
  stats: () => request({ method: 'GET', url: '/admin/stats' }),

  // users
  listUsers: (params) => request({ method: 'GET', url: '/admin/users', params }),
  getUser: (id) => request({ method: 'GET', url: `/admin/users/${id}` }),
  updateUser: (id, payload) => request({ method: 'PATCH', url: `/admin/users/${id}`, data: payload }),
  deleteUser: (id) => request({ method: 'DELETE', url: `/admin/users/${id}` }),

  // orders
  listOrders: (params) => request({ method: 'GET', url: '/admin/orders', params }),
  getOrder: (id) => request({ method: 'GET', url: `/admin/orders/${id}` }),
  updateOrderStatus: (id, status) =>
    request({ method: 'PATCH', url: `/admin/orders/${id}/status`, data: { status } }),

  // products
  listProducts: (params) => request({ method: 'GET', url: '/admin/products', params }),
  getProduct: (id) => request({ method: 'GET', url: `/admin/products/${id}` }),
  createProduct: (payload) => request({ method: 'POST', url: '/admin/products', data: payload }),
  updateProduct: (id, payload) => request({ method: 'PATCH', url: `/admin/products/${id}`, data: payload }),
  deleteProduct: (id, { hard = false } = {}) =>
    request({ method: 'DELETE', url: `/admin/products/${id}`, params: hard ? { hard: 'true' } : undefined }),

  // inventory
  adjustStock: (id, payload) =>
    request({ method: 'PATCH', url: `/admin/products/${id}/stock`, data: payload }),

  // images
  uploadProductImages: (id, files) => {
    const form = new FormData()
    Array.from(files).forEach((file) => form.append('images', file))
    return request({
      method: 'POST',
      url: `/admin/products/${id}/images`,
      data: form,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteProductImage: (id, imageId) =>
    request({ method: 'DELETE', url: `/admin/products/${id}/images/${imageId}` }),
  setPrimaryImage: (id, imageId) =>
    request({ method: 'PATCH', url: `/admin/products/${id}/images/${imageId}/primary` }),

  // payments
  listPayments: (params) => request({ method: 'GET', url: '/admin/payments', params }),
}
