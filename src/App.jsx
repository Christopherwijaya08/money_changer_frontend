import { Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import TransaksiPage from './pages/TransaksiPage'
import MasterKursPage from './pages/MasterKursPage'
import MasterNasabahPage from './pages/MasterNasabahPage'
import ThresholdSettingsPage from './pages/ThresholdSettingsPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<TransaksiPage />} />
        <Route path="/master-kurs" element={<MasterKursPage />} />
        <Route path="/nasabah" element={<MasterNasabahPage />} />
        <Route path="/nasabah/threshold" element={<ThresholdSettingsPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
