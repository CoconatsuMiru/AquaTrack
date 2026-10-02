import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AppLayout } from './layouts/AppLayout'
import { ContainersPage } from './pages/ContainersPage'
import { CustomersPage } from './pages/CustomersPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { TransactionsPage } from './pages/TransactionsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Everything inside this group requires a logged-in user */}
      <Route element={<ProtectedRoute />}>
        {/* ...and is shown inside the sidebar + top bar layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/containers" element={<ContainersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App