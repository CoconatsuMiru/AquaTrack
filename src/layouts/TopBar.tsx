import { LogOut, Plus, Undo2 } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

type TopBarProps = {
  onAssign: () => void
  onReturn: () => void
}

export function TopBar({ onAssign, onReturn }: TopBarProps) {
  const { user, signOut } = useAuth()

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const initial = user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 lg:px-8">
      <p className="hidden text-sm font-medium text-slate-600 lg:block">{today}</p>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onAssign}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus size={16} />
          Assign Container
        </button>
        <button
          type="button"
          onClick={onReturn}
          className="flex items-center gap-2 rounded-lg bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-200"
        >
          <Undo2 size={16} />
          Record Return
        </button>

        <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initial}
          </div>
          <span className="hidden text-sm text-slate-700 xl:inline">{user?.email}</span>
          <button
            type="button"
            onClick={() => signOut().catch(console.error)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}