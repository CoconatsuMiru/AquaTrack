import { PageHeader } from '../components/PageHeader'
import { RecentActivityCard } from '../features/dashboard/RecentActivityCard'
import { StatCards } from '../features/dashboard/StatCards'
import { TopHoldersCard } from '../features/dashboard/TopHoldersCard'
import { TypeBreakdownCards } from '../features/dashboard/TypeBreakdownCards'
import { useDashboard } from '../features/dashboard/useDashboard'

export function DashboardPage() {
  const { summaries, topHolders, recentActivity, isLoading, errorMessage } = useDashboard()

  return (
    <>
      <PageHeader
        title="Station Inventory Overview"
        description="Container balances and recent activity at a glance."
      />

      {isLoading && <p className="py-12 text-center text-sm text-slate-500">Loading dashboard…</p>}

      {!isLoading && errorMessage && (
        <p className="py-12 text-center text-sm text-red-600">
          Could not load the dashboard: {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && (
        <div className="space-y-6">
          <StatCards summaries={summaries} holderCount={topHolders.total} />
          <TypeBreakdownCards summaries={summaries} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TopHoldersCard topHolders={topHolders} />
            <RecentActivityCard rows={recentActivity} />
          </div>
        </div>
      )}
    </>
  )
}