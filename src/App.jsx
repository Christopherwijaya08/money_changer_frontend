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
import { BranchProvider } from './context/BranchContext'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function App() {
  return (
    <AuthProvider>
      <BranchProvider>
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
          </Route>
        </Routes>
      </BranchProvider>
    </AuthProvider>
  )
}

export default App
