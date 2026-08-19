import { Card } from './Card'

export function StatCard({ label, value, detail }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-neutral-500">{detail}</p>
    </Card>
  )
}
