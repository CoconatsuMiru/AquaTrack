import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AssignContainerModal } from '../features/transactions/AssignContainerModal'
import { ReturnContainerModal } from '../features/transactions/ReturnContainerModal'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

type ActiveModal = 'assign' | 'return' | null

export function AppLayout() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          onAssign={() => setActiveModal('assign')}
          onReturn={() => setActiveModal('return')}
        />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {activeModal === 'assign' && <AssignContainerModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'return' && <ReturnContainerModal onClose={() => setActiveModal(null)} />}
    </div>
  )
}