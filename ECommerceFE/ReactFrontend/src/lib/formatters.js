export function formatMoney(minorUnits, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format((minorUnits ?? 0) / 100)
}

/** Backend stores prices and order totals in major units (rupees). */
export function formatAmount(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    currency,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(amount ?? 0)
}

export function formatDate(value) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value ?? 0)
}
