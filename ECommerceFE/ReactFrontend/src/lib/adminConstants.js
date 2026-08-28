/** Mirrors ALLOWED_TRANSITIONS in the backend orders service. */
export const ORDER_TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'refunded'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  refunded: [],
  cancelled: [],
}

export const ORDER_STATUSES = Object.keys(ORDER_TRANSITIONS)

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

export const ORDER_STATUS_TONE = {
  pending: 'amber',
  paid: 'blue',
  processing: 'blue',
  shipped: 'blue',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'red',
}

export const PAYMENT_STATUS_TONE = {
  pending: 'amber',
  paid: 'green',
  failed: 'red',
  refunded: 'red',
}

export const LOW_STOCK_THRESHOLD = 5

export const PAGE_SIZE = 10
