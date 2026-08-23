import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import TransactionPage from './pages/TransactionPage'
import CurrencyPage from './pages/CurrencyPage'
import ExchangeRatePage from './pages/ExchangeRatePage'
import CustomerPage from './pages/CustomerPage'
import ThresholdSettingsPage from './pages/ThresholdSettingsPage'
import EmployeePage from './pages/EmployeePage'
import BranchPage from './pages/BranchPage'
import CashPage from './pages/CashPage'
import ReportPage from './pages/ReportPage'
import DashboardPage from './pages/DashboardPage'
import AccessPage from './pages/AccessPage'
import AuditLogPage from './pages/AuditLogPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import { BranchProvider } from './context/BranchContext'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // BranchProvider lives here (not around the whole app) so it only ever
  // fetches /branches once a token exists — the /login route never mounts it.
  return (
    <BranchProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </BranchProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<TransactionPage />} />
          <Route path="/currencies" element={<CurrencyPage />} />
          <Route path="/exchange-rates" element={<ExchangeRatePage />} />
          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/customers/threshold" element={<ThresholdSettingsPage />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/branches" element={<BranchPage />} />
          <Route path="/cash" element={<CashPage />} />
          <Route path="/reports" element={<ReportPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/access" element={<AccessPage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
