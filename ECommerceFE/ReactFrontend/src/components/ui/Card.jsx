export function Card({ children, className = '' }) {
  return <div className={`rounded-lg border border-neutral-200 bg-white shadow-sm ${className}`}>{children}</div>
}
