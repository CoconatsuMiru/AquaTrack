import { Link } from 'react-router-dom'
import type { ContainerTypeSummary } from '../../types/models'

type TypeBreakdownCardsProps = {
  summaries: ContainerTypeSummary[]
}

export function TypeBreakdownCards({ summaries }: TypeBreakdownCardsProps) {
  // Inactive types only matter while they still have containers
  const visible = summaries.filter((summary) => summary.is_active || summary.total_count > 0)

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
        No container types yet.{' '}
        <Link to="/containers" className="font-medium text-brand-600 hover:text-brand-800">
          Set them up on the Containers page.
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {visible.map((summary) => {
        const percent = (value: number) =>
          summary.total_count === 0 ? 0 : (value / summary.total_count) * 100

        return (
          <div
            key={summary.container_type_id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-900">{summary.name}</h3>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  Key: {summary.identifier_key}
                  {!summary.is_active && ' · Inactive'}
                </p>
              </div>
              <p className="text-3xl font-bold text-brand-700">
                {summary.total_count}
                <span className="ml-1.5 text-sm font-medium text-slate-500">total</span>
              </p>
            </div>

            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="bg-emerald-500"
                style={{ width: `${percent(summary.available_count)}%` }}
              />
              <div
                className="bg-brand-500"
                style={{ width: `${percent(summary.with_customer_count)}%` }}
              />
              <div
                className="bg-slate-400"
                style={{ width: `${percent(summary.retired_count)}%` }}
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <p className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                {summary.available_count} available
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                {summary.with_customer_count} out
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                {summary.retired_count} retired
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}