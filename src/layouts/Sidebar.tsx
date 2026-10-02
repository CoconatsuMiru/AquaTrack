import { NavLink } from 'react-router-dom'
import {
  Droplet,
  LayoutDashboard,
  Package,
  Receipt,
  Users,
  type LucideIcon,
} from 'lucide-react'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/containers', label: 'Containers', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
]

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-sidebar">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Droplet size={20} />
        </div>
        <div>
          <p className="text-lg font-semibold leading-tight text-brand-700">AquaTrack</p>
          <p className="text-xs text-slate-500">Water Refill Station</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-brand-100',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}