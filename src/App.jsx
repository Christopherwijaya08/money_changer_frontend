import { Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import TransaksiPage from './pages/TransaksiPage'
import MasterKursPage from './pages/MasterKursPage'
import MasterNasabahPage from './pages/MasterNasabahPage'
import ThresholdSettingsPage from './pages/ThresholdSettingsPage'
import MasterKaryawanPage from './pages/MasterKaryawanPage'
import MasterCabangPage from './pages/MasterCabangPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<TransaksiPage />} />
        <Route path="/master-kurs" element={<MasterKursPage />} />
        <Route path="/nasabah" element={<MasterNasabahPage />} />
        <Route path="/nasabah/threshold" element={<ThresholdSettingsPage />} />
        <Route path="/karyawan" element={<MasterKaryawanPage />} />
        <Route path="/cabang" element={<MasterCabangPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
