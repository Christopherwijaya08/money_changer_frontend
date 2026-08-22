import { useState } from 'react'
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
import Grid from '@mui/material/Grid'
import { cashBalances, cashDeposits as initialCashDeposits, currencies } from '../mocks/data'
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
  rate: yup
    .number()
    .typeError('Kurs harus diisi')
    .positive('Kurs harus lebih dari 0')
    .required('Kurs harus diisi'),
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
    defaultValues: { currencyCode: '', amount: '', rate: '', note: '' },
    resolver: yupResolver(depositSchema),
  })

  function onSubmit(data) {
    setDeposits((list) => [
      {
        id: Date.now(),
        branchId: selectedBranchId,
        currencyCode: data.currencyCode,
        amount: Number(data.amount),
        rate: Number(data.rate),
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
          <Grid size={{ xs: 12, sm: 3 }}>
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
          <Grid size={{ xs: 12, sm: 3 }}>
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
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="rate"
              control={control}
              render={({ field }) => {
                const [display, handleChange] = useThousandSeparator(field.value, field.onChange)
                return (
                  <TextField
                    fullWidth
                    inputMode="numeric"
                    label="Kurs"
                    error={!!errors.rate}
                    helperText={errors.rate?.message}
                    value={display}
                    onChange={handleChange}
                  />
                )
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
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
              <TableCell align="right">Kurs</TableCell>
              <TableCell>Keterangan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell>{d.createdAt}</TableCell>
                <TableCell>{d.currencyCode}</TableCell>
                <TableCell align="right">{formatBalance(d.amount)}</TableCell>
                <TableCell align="right">{formatBalance(d.rate)}</TableCell>
                <TableCell>{d.note}</TableCell>
              </TableRow>
            ))}
            {history.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
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
        {tab === 2 && (
          <Typography color="text.secondary">{TABS[tab]} akan tersedia di sini.</Typography>
        )}
      </Paper>
    </div>
  )
}
