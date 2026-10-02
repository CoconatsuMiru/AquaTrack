import { PageHeader } from '../components/PageHeader'

export function ContainersPage() {
  return (
    <>
      <PageHeader
        title="Containers"
        description="Every physical container, its type, and where it is right now."
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        The container list will go here.
      </div>
    </>
  )
}