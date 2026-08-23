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
import { cashBalances, cashDeposits as initialCashDeposits, currencies, transactions } from '../mocks/data'
import { useBranch } from '../context/BranchContext'
import { useThousandSeparator } from '../hooks/useThousandSeparator'

const TABS = ['Saldo Kas', 'Setor Kas', 'Rekonsiliasi Harian']

function formatBalance(value) {
  return value.toLocaleString('id-ID')
}

function CashBalanceTab() {
  const { selectedBranchId, branches } = useBranch()
  const branchName = branches.find((b) => b.id === selectedBranchId)?.name
  const balances = cashBalances.filter((b) => b.branchId === selectedBranchId)

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body2" color="text.secondary">
        Menampilkan saldo kas untuk cabang: {branchName}
      </Typography>
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
              <TableRow key={b.currencyCode} hover>
                <TableCell>{b.currencyCode}</TableCell>
                <TableCell>{b.currencyName}</TableCell>
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
  currencyCode: yup.string().required('Pilih mata uang'),
  amount: yup
    .number()
    .typeError('Nominal harus diisi')
    .positive('Nominal harus lebih dari 0')
    .required('Nominal harus diisi'),
  note: yup.string().nullable(),
})

function CashDepositTab() {
  const { selectedBranchId, branches } = useBranch()
  const branchName = branches.find((b) => b.id === selectedBranchId)?.name
  const [deposits, setDeposits] = useState(initialCashDeposits)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { currencyCode: '', amount: '', note: '' },
    resolver: yupResolver(depositSchema),
  })

  function onSubmit(data) {
    setDeposits((list) => [
      {
        id: Date.now(),
        branchId: selectedBranchId,
        currencyCode: data.currencyCode,
        amount: Number(data.amount),
        note: data.note || '',
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      },
      ...list,
    ])
    reset()
  }

  const history = deposits
    .filter((d) => d.branchId === selectedBranchId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="body2" color="text.secondary">
        Menampilkan setor kas untuk cabang: {branchName}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="currencyCode"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label="Mata Uang"
                  error={!!errors.currencyCode}
                  helperText={errors.currencyCode?.message}
                  {...field}
                >
                  {currencies
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <MenuItem key={c.id} value={c.code}>
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
            {history.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell>{d.createdAt}</TableCell>
                <TableCell>{d.currencyCode}</TableCell>
                <TableCell align="right">{formatBalance(d.amount)}</TableCell>
                <TableCell>{d.note}</TableCell>
              </TableRow>
            ))}
            {history.length === 0 && (
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
    onPhysicalChange(row.currencyCode, value)
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
  const branchName = branches.find((b) => b.id === selectedBranchId)?.name
  const [date, setDate] = useState('2026-08-16')
  const [physicalCounts, setPhysicalCounts] = useState({})
  const [saved, setSaved] = useState(false)

  // Physical counts are per-date; switching dates starts a fresh, unsaved count.
  useEffect(() => {
    setPhysicalCounts({})
    setSaved(false)
  }, [date])

  function handlePhysicalChange(code, value) {
    setPhysicalCounts((prev) => ({ ...prev, [code]: value === '' ? '' : Number(value) }))
    setSaved(false)
  }

  const rows = cashBalances
    .filter((b) => b.branchId === selectedBranchId)
    .map((b) => {
      const masuk =
        transactions
          .filter(
            (t) =>
              t.branchId === selectedBranchId &&
              t.currencyCode === b.currencyCode &&
              t.type === 'buy' &&
              t.createdAt.startsWith(date)
          )
          .reduce((sum, t) => sum + t.amount, 0) +
        initialCashDeposits
          .filter(
            (d) =>
              d.branchId === selectedBranchId &&
              d.currencyCode === b.currencyCode &&
              d.createdAt.startsWith(date)
          )
          .reduce((sum, d) => sum + d.amount, 0)

      const keluar = transactions
        .filter(
          (t) =>
            t.branchId === selectedBranchId &&
            t.currencyCode === b.currencyCode &&
            t.type === 'sell' &&
            t.createdAt.startsWith(date)
        )
        .reduce((sum, t) => sum + t.amount, 0)

      const saldoAkhirSistem = b.balance
      const saldoAwal = saldoAkhirSistem - masuk + keluar

      return {
        currencyCode: b.currencyCode,
        saldoAwal,
        masuk,
        keluar,
        saldoAkhirSistem,
        saldoFisik: physicalCounts[b.currencyCode] ?? '',
      }
    })

  const hasAnyCount = rows.some((row) => row.saldoFisik !== '')

  function handleSaveReconciliation() {
    // ponytail: no backend wiring yet (Fase 5 integration); confirms the count was recorded for this date
    setSaved(true)
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
            {rows.map((row) => (
              <ReconciliationRow key={row.currencyCode} row={row} onPhysicalChange={handlePhysicalChange} />
            ))}
            {rows.length === 0 && (
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
        <Button variant="contained" disabled={!hasAnyCount} onClick={handleSaveReconciliation}>
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
