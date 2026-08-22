import { Outlet, Route, Routes } from 'react-router-dom'
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
import { BranchProvider } from './context/BranchContext'

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function App() {
  return (
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
        </Route>
      </Routes>
    </BranchProvider>
  )
}

export default App
