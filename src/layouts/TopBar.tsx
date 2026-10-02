import { LogOut } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

export function TopBar() {
  const { user, signOut } = useAuth()

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const initial = user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
      <p className="text-sm font-medium text-slate-600">{today}</p>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {initial}
        </div>
        <span className="hidden text-sm text-slate-700 sm:inline">{user?.email}</span>
        <button
          type="button"
          onClick={() => signOut().catch(console.error)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </header>
  )
}