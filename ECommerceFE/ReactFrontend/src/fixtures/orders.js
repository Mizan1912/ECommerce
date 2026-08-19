import { products } from './products'

export const orders = [
  {
    id: 'ord-1001',
    orderNumber: 'EC-2026-1001',
    createdAt: '2026-05-20',
    status: 'paid',
    paymentStatus: 'succeeded',
    totalMinor: 999800,
    currency: 'INR',
    items: [
      { product: products[0], quantity: 1, unitPriceMinor: products[0].priceMinor },
      { product: products[3], quantity: 1, unitPriceMinor: products[3].priceMinor },
    ],
    address: 'Bandra West, Mumbai, Maharashtra',
  },
  {
    id: 'ord-1002',
    orderNumber: 'EC-2026-1002',
    createdAt: '2026-05-22',
    status: 'pending_payment',
    paymentStatus: 'initiated',
    totalMinor: 1299900,
    currency: 'INR',
    items: [{ product: products[2], quantity: 1, unitPriceMinor: products[2].priceMinor }],
    address: 'Indiranagar, Bengaluru, Karnataka',
  },
]
