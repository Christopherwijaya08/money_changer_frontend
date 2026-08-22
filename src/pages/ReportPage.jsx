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
import TableSortLabel from '@mui/material/TableSortLabel'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { currencies, employees, transactions } from '../mocks/data'
import { useBranch } from '../context/BranchContext'
import { downloadCsv } from '../utils/exportCsv'

const TABS = ['Laporan Laba-Rugi', 'Laporan per Karyawan']

function formatNumber(value) {
  return value.toLocaleString('id-ID')
}

function computeMargin(t) {
  return t.type === 'buy' ? (t.rateDefault - t.rateActual) * t.amount : (t.rateActual - t.rateDefault) * t.amount
}

function ExportButtons({ onExportExcel }) {
  return (
    <div className="flex gap-2">
      <Button size="small" startIcon={<FileDownloadIcon />} onClick={onExportExcel}>
        Export Excel
      </Button>
      <Button size="small" startIcon={<PictureAsPdfIcon />} onClick={() => window.print()}>
        Export PDF
      </Button>
    </div>
  )
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

  function exportExcel() {
    downloadCsv(
      'laporan-laba-rugi.csv',
      ['No. Transaksi', 'Tanggal', 'Tipe', 'Mata Uang', 'Nominal', 'Kurs Default', 'Kurs Aktual', 'Laba/Rugi'],
      filtered.map((t) => [
        t.transactionNumber,
        t.createdAt,
        t.type === 'buy' ? 'Beli' : 'Jual',
        t.currencyCode,
        t.amount,
        t.rateDefault,
        t.rateActual,
        t.margin,
      ])
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body2" color="text.secondary">
        Menampilkan laporan laba-rugi untuk cabang: {branchName}
      </Typography>

      <div className="flex flex-wrap gap-4 items-center justify-between">
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
        <ExportButtons onExportExcel={exportExcel} />
      </div>

      <TableContainer className="print-area">
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

const EMPLOYEE_COLUMNS = [
  { key: 'name', label: 'Nama Karyawan' },
  { key: 'jumlahTransaksi', label: 'Jumlah Transaksi', align: 'right' },
  { key: 'totalOmzet', label: 'Total Omzet', align: 'right' },
  { key: 'totalMargin', label: 'Total Laba/Rugi', align: 'right' },
]

function EmployeeReportTab() {
  const { selectedBranchId, branches } = useBranch()
  const branchName = branches.find((b) => b.id === selectedBranchId)?.name
  const [orderBy, setOrderBy] = useState('totalOmzet')
  const [order, setOrder] = useState('desc')

  const rows = employees
    .filter((e) => e.branchId === selectedBranchId)
    .map((e) => {
      const employeeTransactions = transactions.filter(
        (t) => t.branchId === selectedBranchId && t.employeeName === e.name
      )
      return {
        id: e.id,
        name: e.name,
        jumlahTransaksi: employeeTransactions.length,
        totalOmzet: employeeTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
        totalMargin: employeeTransactions.reduce((sum, t) => sum + computeMargin(t), 0),
      }
    })
    .sort((a, b) => {
      const dir = order === 'asc' ? 1 : -1
      if (a[orderBy] < b[orderBy]) return -1 * dir
      if (a[orderBy] > b[orderBy]) return 1 * dir
      return 0
    })

  function handleSort(column) {
    if (orderBy === column) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setOrderBy(column)
      setOrder('desc')
    }
  }

  function exportExcel() {
    downloadCsv(
      'laporan-per-karyawan.csv',
      ['Nama Karyawan', 'Jumlah Transaksi', 'Total Omzet', 'Total Laba/Rugi'],
      rows.map((r) => [r.name, r.jumlahTransaksi, r.totalOmzet, r.totalMargin])
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Typography variant="body2" color="text.secondary">
          Menampilkan laporan per karyawan untuk cabang: {branchName}
        </Typography>
        <ExportButtons onExportExcel={exportExcel} />
      </div>
      <TableContainer className="print-area">
        <Table size="small">
          <TableHead>
            <TableRow>
              {EMPLOYEE_COLUMNS.map((col) => (
                <TableCell key={col.key} align={col.align}>
                  <TableSortLabel
                    active={orderBy === col.key}
                    direction={orderBy === col.key ? order : 'asc'}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.name}</TableCell>
                <TableCell align="right">{r.jumlahTransaksi}</TableCell>
                <TableCell align="right">{formatNumber(r.totalOmzet)}</TableCell>
                <TableCell
                  align="right"
                  sx={{ color: r.totalMargin >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}
                >
                  {formatNumber(r.totalMargin)}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Belum ada karyawan untuk cabang ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
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
        {tab === 1 && <EmployeeReportTab />}
      </Paper>
    </div>
  )
}
