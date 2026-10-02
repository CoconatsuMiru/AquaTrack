import { PageHeader } from '../components/PageHeader'

export function TransactionsPage() {
  return (
    <>
      <PageHeader
        title="Transactions"
        description="The full history of container assignments and returns."
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        The transaction history will go here.
      </div>
    </>
  )
}