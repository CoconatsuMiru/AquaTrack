import { useAsyncData } from '../../hooks/useAsyncData'
import {
  listContainerTypeSummaries,
  listRecentTransactions,
  listTopHolders,
  type TopHolders,
} from '../../services/dashboard'
import type { ContainerTypeSummary, TransactionHistoryRow } from '../../types/models'

const TOP_HOLDERS_LIMIT = 5
const RECENT_ACTIVITY_LIMIT = 8

const noSummaries: ContainerTypeSummary[] = []
const noHolders: TopHolders = { holders: [], total: 0 }
const noActivity: TransactionHistoryRow[] = []

// Defined once here (not inside the hook) so they stay the same between renders
const fetchTopHolders = () => listTopHolders(TOP_HOLDERS_LIMIT)
const fetchRecentActivity = () => listRecentTransactions(RECENT_ACTIVITY_LIMIT)

// All three reload by themselves whenever a container is assigned or returned
export function useDashboard() {
  const summaries = useAsyncData(listContainerTypeSummaries, noSummaries)
  const holders = useAsyncData(fetchTopHolders, noHolders)
  const activity = useAsyncData(fetchRecentActivity, noActivity)

  return {
    summaries: summaries.data,
    topHolders: holders.data,
    recentActivity: activity.data,
    isLoading: summaries.isLoading || holders.isLoading || activity.isLoading,
    errorMessage: summaries.errorMessage || holders.errorMessage || activity.errorMessage,
  }
}