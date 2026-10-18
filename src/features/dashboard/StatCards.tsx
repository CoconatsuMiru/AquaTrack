import { Package, Truck, Users, Warehouse } from 'lucide-react'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import type { ContainerTypeSummary } from '../../types/models'

type StatCardsProps = {
  summaries: ContainerTypeSummary[]
  // How many customers currently hold containers
  holderCount: number
}

function sum(summaries: ContainerTypeSummary[], pick: (summary: ContainerTypeSummary) => number) {
  return summaries.reduce((total, summary) => total + pick(summary), 0)
}

export function StatCards({ summaries, holderCount }: StatCardsProps) {
  const total = sum(summaries, (summary) => summary.total_count)
  const available = sum(summaries, (summary) => summary.available_count)
  const withCustomers = sum(summaries, (summary) => summary.with_customer_count)
  const activeTypes = summaries.filter((summary) => summary.is_active).length

  const percentOfFleet = (value: number) => (total === 0 ? 0 : Math.round((value / total) * 100))

  const cards = [
    {
      label: 'Total containers',
      value: total,
      note: `${activeTypes} active ${activeTypes === 1 ? 'type' : 'types'}`,
      icon: Package,
    },
    {
      label: 'Available at station',
      value: available,
      note: `${percentOfFleet(available)}% of all containers`,
      icon: Warehouse,
    },
    {
      label: 'With customers',
      value: withCustomers,
      note: `${percentOfFleet(withCustomers)}% of all containers`,
      icon: Truck,
    },
    {
      label: 'Customers holding containers',
      value: holderCount,
      note: 'Customers with at least one container',
      icon: Users,
    },
  ]

  return (
    <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, note, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon size={18} />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            <AnimatedNumber value={value} />
          </p>
          <p className="mt-1 text-xs text-slate-500">{note}</p>
        </div>
      ))}
    </div>
  )
}