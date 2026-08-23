import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
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
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import { apiClient } from '../api/apiClient'
import { useBranch } from '../context/BranchContext'
import { useAuth } from '../context/AuthContext'
import { useThousandSeparator } from '../hooks/useThousandSeparator'
import { formatDateTime } from '../utils/formatDateTime'

const TABS = ['Saldo Kas', 'Setor Kas', 'Rekonsiliasi Harian']

function formatBalance(value) {
  return Number(value).toLocaleString('id-ID')
}

function CashBalanceTab() {
  const { selectedBranchId, branches } = useBranch()
  const branchName = branches.find((b) => b.id === selectedBranchId)?.name
  const [balances, setBalances] = useState([])
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    if (!selectedBranchId) return
    let cancelled = false

    async function load() {
      try {
        const res = await apiClient.get('/cash-balances', { branch_id: selectedBranchId })
        if (!cancelled) setBalances(res.data)
      } catch (err) {
        if (!cancelled) setPageError(err.message ?? 'Gagal memuat saldo kas')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selectedBranchId])

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body2" color="text.secondary">
        Menampilkan saldo kas untuk cabang: {branchName}
      </Typography>
      {pageError && (
        <Alert severity="error" onClose={() => setPageError('')}>
          {pageError}
        </Alert>
      )}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mata Uang</TableCell>
              <TableCell>Nama</TableCell>
              <TableCell align="right">Saldo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.map((b) => (
              <TableRow key={b.currency_id} hover>
                <TableCell>{b.currency_code}</TableCell>
                <TableCell>{b.currency_name}</TableCell>
                <TableCell align="right">{formatBalance(b.balance)}</TableCell>
              </TableRow>
            ))}
            {balances.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Belum ada data saldo kas untuk cabang ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

const depositSchema = yup.object({
  currencyId: yup.number().typeError('Pilih mata uang').required('Pilih mata uang'),
  amount: yup
    .number()
    .typeError('Nominal harus diisi')
    .positive('Nominal harus lebih dari 0')
    .required('Nominal harus diisi'),
  note: yup.string().nullable(),
})

function CashDepositTab() {
  const { selectedBranchId, branches } = useBranch()
  const { userId } = useAuth()
  const branchName = branches.find((b) => b.id === selectedBranchId)?.name
  const [currencies, setCurrencies] = useState([])
  const [deposits, setDeposits] = useState([])
  const [pageError, setPageError] = useState('')

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { currencyId: '', amount: '', note: '' },
    resolver: yupResolver(depositSchema),
  })

  async function loadDeposits() {
    if (!selectedBranchId) return
    try {
      const res = await apiClient.get('/cash-deposits', { branch_id: selectedBranchId, per_page: 100 })
      setDeposits(res.data)
    } catch (err) {
      setPageError(err.message ?? 'Gagal memuat riwayat setor kas')
    }
  }

  useEffect(() => {
    async function loadCurrencies() {
      try {
        const res = await apiClient.get('/currencies', { active_only: true })
        setCurrencies(res.data)
      } catch (err) {
        setPageError(err.message ?? 'Gagal memuat data mata uang')
      }
    }
    loadCurrencies()
  }, [])

  useEffect(() => {
    loadDeposits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId])

  async function onSubmit(data) {
    try {
      setPageError('')
      await apiClient.post('/cash-deposits', {
        branch_id: selectedBranchId,
        currency_id: data.currencyId,
        amount: Number(data.amount),
        note: data.note || '',
        user_id: userId,
      })
      reset()
      loadDeposits()
    } catch (err) {
      setPageError(err.message ?? 'Gagal menyimpan setoran')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="body2" color="text.secondary">
        Menampilkan setor kas untuk cabang: {branchName}
      </Typography>

      {pageError && (
        <Alert severity="error" onClose={() => setPageError('')}>
          {pageError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="currencyId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label="Mata Uang"
                  error={!!errors.currencyId}
                  helperText={errors.currencyId?.message}
                  {...field}
                >
                  {currencies.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.code}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => {
                const [display, handleChange] = useThousandSeparator(field.value, field.onChange)
                return (
                  <TextField
                    fullWidth
                    inputMode="numeric"
                    label="Nominal"
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    value={display}
                    onChange={handleChange}
                  />
                )
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label="Keterangan" {...register('note')} />
          </Grid>
          <Grid size={12} className="flex justify-end">
            <Button type="submit" variant="contained">
              Simpan Setoran
            </Button>
          </Grid>
        </Grid>
      </form>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tanggal</TableCell>
              <TableCell>Mata Uang</TableCell>
              <TableCell align="right">Nominal</TableCell>
              <TableCell>Keterangan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deposits.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell>{formatDateTime(d.created_at)}</TableCell>
                <TableCell>{d.currency_code}</TableCell>
                <TableCell align="right">{formatBalance(d.amount)}</TableCell>
                <TableCell>{d.note}</TableCell>
              </TableRow>
            ))}
            {deposits.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Belum ada riwayat setor kas untuk cabang ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

function ReconciliationRow({ row, onPhysicalChange }) {
  const [display, handleChange] = useThousandSeparator(row.saldoFisik, (value) =>
    onPhysicalChange(row.currencyId, value)
  )
  const hasCounted = row.saldoFisik !== ''
  const selisih = hasCounted ? row.saldoFisik - row.saldoAkhirSistem : null

  return (
    <TableRow hover>
      <TableCell>{row.currencyCode}</TableCell>
      <TableCell align="right">{formatBalance(row.saldoAwal)}</TableCell>
      <TableCell align="right">{formatBalance(row.masuk)}</TableCell>
      <TableCell align="right">{formatBalance(row.keluar)}</TableCell>
      <TableCell align="right">{formatBalance(row.saldoAkhirSistem)}</TableCell>
      <TableCell align="right">
        <TextField
          size="small"
          inputMode="numeric"
          placeholder={formatBalance(row.saldoAkhirSistem)}
          value={display}
          onChange={handleChange}
          sx={{ width: 140 }}
        />
      </TableCell>
      <TableCell
        align="right"
        sx={{ color: !hasCounted ? 'text.secondary' : selisih === 0 ? 'success.main' : 'error.main', fontWeight: 600 }}
      >
        {hasCounted ? formatBalance(selisih) : '-'}
      </TableCell>
    </TableRow>
  )
}

function ReconciliationTab() {
  const { selectedBranchId, branches } = useBranch()
  const { userId } = useAuth()
  const branchName = branches.find((b) => b.id === selectedBranchId)?.name
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState([])
  const [physicalCounts, setPhysicalCounts] = useState({})
  const [saved, setSaved] = useState(false)
  const [pageError, setPageError] = useState('')

  async function loadRows() {
    if (!selectedBranchId) return
    try {
      const res = await apiClient.get('/cash-reconciliations', { branch_id: selectedBranchId, date })
      setRows(res.data)
    } catch (err) {
      setPageError(err.message ?? 'Gagal memuat data rekonsiliasi')
    }
  }

  useEffect(() => {
    loadRows()
    setPhysicalCounts({})
    setSaved(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, date])

  function handlePhysicalChange(currencyId, value) {
    setPhysicalCounts((prev) => ({ ...prev, [currencyId]: value === '' ? '' : Number(value) }))
    setSaved(false)
  }

  const tableRows = rows.map((r) => ({
    currencyId: r.currency_id,
    currencyCode: r.currency_code,
    saldoAwal: r.opening_balance,
    masuk: r.cash_in,
    keluar: r.cash_out,
    saldoAkhirSistem: r.system_balance,
    saldoFisik: physicalCounts[r.currency_id] ?? r.physical_balance ?? '',
  }))

  const countedRows = tableRows.filter((row) => row.saldoFisik !== '')

  async function handleSaveReconciliation() {
    try {
      setPageError('')
      await Promise.all(
        countedRows.map((row) =>
          apiClient.post('/cash-reconciliations', {
            branch_id: selectedBranchId,
            currency_id: row.currencyId,
            date,
            physical_balance: row.saldoFisik,
            user_id: userId,
          })
        )
      )
      setSaved(true)
      setPhysicalCounts({})
      loadRows()
    } catch (err) {
      setPageError(err.message ?? 'Gagal menyimpan rekonsiliasi')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Typography variant="body2" color="text.secondary">
          Menampilkan rekonsiliasi untuk cabang: {branchName}
        </Typography>
        <TextField
          size="small"
          type="date"
          label="Tanggal"
          slotProps={{ inputLabel: { shrink: true } }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      {pageError && (
        <Alert severity="error" onClose={() => setPageError('')}>
          {pageError}
        </Alert>
      )}
      {saved && (
        <Alert severity="success" onClose={() => setSaved(false)}>
          Rekonsiliasi tanggal {date} berhasil disimpan.
        </Alert>
      )}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mata Uang</TableCell>
              <TableCell align="right">Saldo Awal</TableCell>
              <TableCell align="right">Masuk</TableCell>
              <TableCell align="right">Keluar</TableCell>
              <TableCell align="right">Saldo Akhir (Sistem)</TableCell>
              <TableCell align="right">Saldo Fisik</TableCell>
              <TableCell align="right">Selisih</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map((row) => (
              <ReconciliationRow key={row.currencyId} row={row} onPhysicalChange={handlePhysicalChange} />
            ))}
            {tableRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Belum ada data untuk cabang ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-end">
        <Button variant="contained" disabled={countedRows.length === 0} onClick={handleSaveReconciliation}>
          Simpan Rekonsiliasi
        </Button>
      </div>
    </div>
  )
}

export default function CashPage() {
  const [tab, setTab] = useState(0)

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Kas
      </Typography>

      <Paper>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          {TABS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Paper>

      <Paper className="p-6">
        {tab === 0 && <CashBalanceTab />}
        {tab === 1 && <CashDepositTab />}
        {tab === 2 && <ReconciliationTab />}
      </Paper>
    </div>
  )
}
