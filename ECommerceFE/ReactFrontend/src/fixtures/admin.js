import { orders } from './orders'
import { products } from './products'

export const adminProducts = products

export const adminOrders = orders

export const adminUsers = [
  { id: 'usr-001', name: 'Customer Preview', email: 'customer@example.com', role: 'customer', status: 'active' },
  { id: 'usr-002', name: 'Admin Preview', email: 'admin@example.com', role: 'admin', status: 'active' },
]

export const paymentEvents = [
  { id: 'evt-001', event: 'payment.succeeded', orderNumber: 'EC-2026-1001', status: 'processed' },
  { id: 'evt-002', event: 'payment.pending', orderNumber: 'EC-2026-1002', status: 'waiting' },
]
