export function formatMoney(minorUnits, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format((minorUnits ?? 0) / 100)
}
