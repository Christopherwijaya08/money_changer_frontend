import { useEffect, useState } from 'react'
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
import Alert from '@mui/material/Alert'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { apiClient, API_BASE_URL } from '../api/apiClient'
import { useBranch } from '../context/BranchContext'
import { formatDateTime } from '../utils/formatDateTime'

const TABS = ['Laporan Laba-Rugi', 'Laporan per Karyawan']

function formatNumber(value) {
  return Number(value).toLocaleString('id-ID')
}

function ExportButtons({ csvUrl, pdfUrl }) {
  return (
    <div className="flex gap-2">
      <Button size="small" startIcon={<FileDownloadIcon />} onClick={() => window.open(csvUrl)}>
        Export Excel
      </Button>
      <Button size="small" startIcon={<PictureAsPdfIcon />} onClick={() => window.open(pdfUrl)}>
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
  const [currencyId, setCurrencyId] = useState('')
  const [currencies, setCurrencies] = useState([])
  const [rows, setRows] = useState([])
  const [totalMargin, setTotalMargin] = useState(0)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    async function loadCurrencies() {
      try {
        const res = await apiClient.get('/currencies')
        setCurrencies(res.data)
      } catch (err) {
        setPageError(err.message ?? 'Gagal memuat data mata uang')
      }
    }
    loadCurrencies()
  }, [])

  useEffect(() => {
    if (!selectedBranchId) return
    let cancelled = false

    async function load() {
      try {
        const res = await apiClient.get('/reports/profit-loss', {
          branch_id: selectedBranchId,
          currency_id: currencyId || undefined,
          date_from: dateFrom,
          date_to: dateTo,
        })
        if (cancelled) return
        setRows(res.data)
        setTotalMargin(Number(res.total_margin))
      } catch (err) {
        if (!cancelled) setPageError(err.message ?? 'Gagal memuat laporan laba-rugi')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selectedBranchId, currencyId, dateFrom, dateTo])

  function resetFilters() {
    setDateFrom('2026-08-01')
    setDateTo('2026-08-31')
    setCurrencyId('')
  }

  const exportParams = new URLSearchParams({
    branch_id: selectedBranchId,
    date_from: dateFrom,
    date_to: dateTo,
    ...(currencyId ? { currency_id: currencyId } : {}),
  })

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body2" color="text.secondary">
        Menampilkan laporan laba-rugi untuk cabang: {branchName}
      </Typography>

      {pageError && (
        <Alert severity="error" onClose={() => setPageError('')}>
          {pageError}
        </Alert>
      )}

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
            value={currencyId}
            onChange={(e) => setCurrencyId(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">Semua</MenuItem>
            {currencies.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.code}
              </MenuItem>
            ))}
          </TextField>
          <Button onClick={resetFilters}>Reset Filter</Button>
        </div>
        <ExportButtons
          csvUrl={`${API_BASE_URL}/reports/profit-loss/export?${exportParams}`}
          pdfUrl={`${API_BASE_URL}/reports/profit-loss/export?format=pdf&${exportParams}`}
        />
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
            {rows.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.transaction_number}</TableCell>
                <TableCell>{formatDateTime(t.created_at)}</TableCell>
                <TableCell>{t.type === 'buy' ? 'Beli' : 'Jual'}</TableCell>
                <TableCell>{t.currency_code}</TableCell>
                <TableCell align="right">{formatNumber(t.amount)}</TableCell>
                <TableCell align="right">{formatNumber(t.rate_default)}</TableCell>
                <TableCell align="right">{formatNumber(t.rate_actual)}</TableCell>
                <TableCell align="right" sx={{ color: t.margin >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                  {formatNumber(t.margin)}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Tidak ada transaksi yang cocok dengan filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {rows.length > 0 && (
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
  { key: 'employee_name', label: 'Nama Karyawan' },
  { key: 'transaction_count', label: 'Jumlah Transaksi', align: 'right' },
  { key: 'total_omzet', label: 'Total Omzet', align: 'right' },
  { key: 'total_margin', label: 'Total Laba/Rugi', align: 'right' },
]

function EmployeeReportTab() {
  const { selectedBranchId, branches } = useBranch()
  const branchName = branches.find((b) => b.id === selectedBranchId)?.name
  const [orderBy, setOrderBy] = useState('total_omzet')
  const [order, setOrder] = useState('desc')
  const [rows, setRows] = useState([])
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    if (!selectedBranchId) return
    let cancelled = false

    async function load() {
      try {
        const res = await apiClient.get('/reports/employee-performance', { branch_id: selectedBranchId })
        if (!cancelled) setRows(res.data)
      } catch (err) {
        if (!cancelled) setPageError(err.message ?? 'Gagal memuat laporan per karyawan')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selectedBranchId])

  const sortedRows = [...rows].sort((a, b) => {
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

  const exportParams = new URLSearchParams({ branch_id: selectedBranchId })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Typography variant="body2" color="text.secondary">
          Menampilkan laporan per karyawan untuk cabang: {branchName}
        </Typography>
        <ExportButtons
          csvUrl={`${API_BASE_URL}/reports/employee-performance/export?${exportParams}`}
          pdfUrl={`${API_BASE_URL}/reports/employee-performance/export?format=pdf&${exportParams}`}
        />
      </div>
      {pageError && (
        <Alert severity="error" onClose={() => setPageError('')}>
          {pageError}
        </Alert>
      )}
      <TableContainer>
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
            {sortedRows.map((r) => (
              <TableRow key={r.employee_id} hover>
                <TableCell>{r.employee_name}</TableCell>
                <TableCell align="right">{r.transaction_count}</TableCell>
                <TableCell align="right">{formatNumber(r.total_omzet)}</TableCell>
                <TableCell
                  align="right"
                  sx={{ color: r.total_margin >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}
                >
                  {formatNumber(r.total_margin)}
                </TableCell>
              </TableRow>
            ))}
            {sortedRows.length === 0 && (
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
