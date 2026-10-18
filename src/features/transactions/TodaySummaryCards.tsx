import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine } from 'lucide-react'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import type { TodayCounts } from '../../services/transactions'

type TodaySummaryCardsProps = {
  counts: TodayCounts
  isLoading: boolean
}

export function TodaySummaryCards({ counts, isLoading }: TodaySummaryCardsProps) {
  const net = counts.assigned - counts.returned

  const cards = [
    {
      label: 'Assigned today',
      value: counts.assigned,
      signed: false,
      note: 'Containers given to customers',
      icon: ArrowUpFromLine,
    },
    {
      label: 'Returned today',
      value: counts.returned,
      signed: false,
      note: 'Containers taken back',
      icon: ArrowDownToLine,
    },
    {
      label: 'Net containers out',
      value: net,
      signed: true,
      note: 'Assigned minus returned today',
      icon: ArrowLeftRight,
    },
  ]

  return (
    <div className="stagger grid gap-4 sm:grid-cols-3">
      {cards.map(({ label, value, signed, note, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon size={18} />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {isLoading ? '…' : <AnimatedNumber value={value} signed={signed} />}
          </p>
          <p className="mt-1 text-xs text-slate-500">{note}</p>
        </div>
      ))}
    </div>
  )
}