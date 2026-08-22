import { useState } from 'react'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import { currencies, transactions } from '../mocks/data'
import { useBranch } from '../context/BranchContext'

const TABS = ['Laporan Laba-Rugi', 'Laporan per Karyawan']

function formatNumber(value) {
  return value.toLocaleString('id-ID')
}

function computeMargin(t) {
  return t.type === 'buy' ? (t.rateDefault - t.rateActual) * t.amount : (t.rateActual - t.rateDefault) * t.amount
}

function ProfitLossTab() {
  const { selectedBranchId, branches } = useBranch()
  const branchName = branches.find((b) => b.id === selectedBranchId)?.name
  const [dateFrom, setDateFrom] = useState('2026-08-01')
  const [dateTo, setDateTo] = useState('2026-08-31')
  const [currencyCode, setCurrencyCode] = useState('')

  const filtered = transactions
    .filter((t) => t.branchId === selectedBranchId)
    .filter((t) => !currencyCode || t.currencyCode === currencyCode)
    .filter((t) => {
      const date = t.createdAt.slice(0, 10)
      return date >= dateFrom && date <= dateTo
    })
    .map((t) => ({ ...t, margin: computeMargin(t) }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  const totalMargin = filtered.reduce((sum, t) => sum + t.margin, 0)

  function resetFilters() {
    setDateFrom('2026-08-01')
    setDateTo('2026-08-31')
    setCurrencyCode('')
  }

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body2" color="text.secondary">
        Menampilkan laporan laba-rugi untuk cabang: {branchName}
      </Typography>

      <div className="flex flex-wrap gap-4 items-center">
        <TextField
          size="small"
          type="date"
          label="Dari Tanggal"
          slotProps={{ inputLabel: { shrink: true } }}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <TextField
          size="small"
          type="date"
          label="Sampai Tanggal"
          slotProps={{ inputLabel: { shrink: true } }}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <TextField
          size="small"
          select
          label="Mata Uang"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Semua</MenuItem>
          {currencies.map((c) => (
            <MenuItem key={c.id} value={c.code}>
              {c.code}
            </MenuItem>
          ))}
        </TextField>
        <Button onClick={resetFilters}>Reset Filter</Button>
      </div>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>No. Transaksi</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Tipe</TableCell>
              <TableCell>Mata Uang</TableCell>
              <TableCell align="right">Nominal</TableCell>
              <TableCell align="right">Kurs Default</TableCell>
              <TableCell align="right">Kurs Aktual</TableCell>
              <TableCell align="right">Laba/Rugi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.transactionNumber}</TableCell>
                <TableCell>{t.createdAt}</TableCell>
                <TableCell>{t.type === 'buy' ? 'Beli' : 'Jual'}</TableCell>
                <TableCell>{t.currencyCode}</TableCell>
                <TableCell align="right">{formatNumber(t.amount)}</TableCell>
                <TableCell align="right">{formatNumber(t.rateDefault)}</TableCell>
                <TableCell align="right">{formatNumber(t.rateActual)}</TableCell>
                <TableCell align="right" sx={{ color: t.margin >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                  {formatNumber(t.margin)}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Tidak ada transaksi yang cocok dengan filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {filtered.length > 0 && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} align="right" sx={{ fontWeight: 700 }}>
                  Total Laba/Rugi
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, color: totalMargin >= 0 ? 'success.main' : 'error.main' }}
                >
                  {formatNumber(totalMargin)}
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </div>
  )
}

export default function ReportPage() {
  const [tab, setTab] = useState(0)

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Laporan
      </Typography>

      <Paper>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          {TABS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Paper>

      <Paper className="p-6">
        {tab === 0 && <ProfitLossTab />}
        {tab === 1 && (
          <Typography color="text.secondary">{TABS[tab]} akan tersedia di sini.</Typography>
        )}
      </Paper>
    </div>
  )
}
