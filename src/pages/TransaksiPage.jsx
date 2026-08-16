import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import PrintIcon from '@mui/icons-material/Print'
import { currencies, customers as initialCustomers, employees, transactions as initialTransactions } from '../mocks/data'
import CustomerQuickAddDialog from '../components/CustomerQuickAddDialog'
import CustomerSearchField from '../components/CustomerSearchField'
import NotaDialog from '../components/NotaDialog'

const REVIEW_THRESHOLD = 50000000

const activeEmployees = employees.filter((e) => e.isActive)

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const defaultFormValues = {
  type: 'buy',
  currencyId: currencies[0].id,
  amount: '',
  rateActual: currencies[0].rateBuy,
  customer: null,
  employeeId: '',
}

const transactionSchema = yup.object({
  type: yup.string().required(),
  currencyId: yup.number().required(),
  amount: yup
    .number()
    .typeError('Nominal harus lebih dari 0')
    .positive('Nominal harus lebih dari 0')
    .required('Nominal harus lebih dari 0'),
  rateActual: yup
    .number()
    .typeError('Kurs harus lebih dari 0')
    .positive('Kurs harus lebih dari 0')
    .required('Kurs harus lebih dari 0'),
  customer: yup
    .object()
    .nullable()
    .test('required', 'Pilih customer', (v) => !!v),
  employeeId: yup.number().typeError('Pilih karyawan').required('Pilih karyawan'),
})

export default function TransaksiPage() {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultFormValues, resolver: yupResolver(transactionSchema) })

  const [customerList, setCustomerList] = useState(initialCustomers)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [notaTransaction, setNotaTransaction] = useState(null)
  const [notaOpen, setNotaOpen] = useState(false)

  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterCurrency, setFilterCurrency] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  function handleResetFilters() {
    setFilterEmployee('')
    setFilterCurrency('')
    setFilterDate('')
    setFilterCustomer('')
    setPage(0)
  }

  const type = watch('type')
  const currencyId = watch('currencyId')
  const amount = watch('amount')
  const rateActual = watch('rateActual')

  const selectedCurrency = currencies.find((c) => c.id === currencyId)
  const rateDefault = type === 'buy' ? selectedCurrency?.rateBuy : selectedCurrency?.rateSell
  const total = (Number(amount) || 0) * (Number(rateActual) || 0)

  function handleCurrencyChange(id) {
    const c = currencies.find((cur) => cur.id === id)
    setValue('rateActual', getValues('type') === 'buy' ? c.rateBuy : c.rateSell)
  }

  function handleTypeChange(value) {
    const c = currencies.find((cur) => cur.id === getValues('currencyId'))
    setValue('rateActual', value === 'buy' ? c.rateBuy : c.rateSell)
  }

  function handleCustomerAdded(newCustomer) {
    setCustomerList((list) => [...list, newCustomer])
    setValue('customer', newCustomer)
  }

  function onSubmit(data) {
    const employee = employees.find((e) => e.id === data.employeeId)
    const now = new Date()
    const totalAmount = Number(data.amount) * Number(data.rateActual)
    const newTransaction = {
      id: Date.now(),
      transactionNumber: `TRX-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(transactions.length + 1).padStart(3, '0')}`,
      type: data.type,
      currencyCode: selectedCurrency.code,
      amount: Number(data.amount),
      rateActual: Number(data.rateActual),
      totalAmount,
      customerName: data.customer.name,
      employeeName: employee.name,
      requiresReview: totalAmount > REVIEW_THRESHOLD,
      createdAt: now.toISOString().slice(0, 16).replace('T', ' '),
    }

    setTransactions((list) => [newTransaction, ...list])
    setNotaTransaction(newTransaction)
    setNotaOpen(true)
    reset({ ...data, amount: '', customer: null, employeeId: '' })
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterEmployee && t.employeeName !== filterEmployee) return false
      if (filterCurrency && t.currencyCode !== filterCurrency) return false
      if (filterCustomer && t.customerName !== filterCustomer) return false
      if (filterDate && !t.createdAt.startsWith(filterDate)) return false
      return true
    })
  }, [transactions, filterEmployee, filterCurrency, filterCustomer, filterDate])

  useEffect(() => {
    setPage(0)
  }, [filterEmployee, filterCurrency, filterCustomer, filterDate])

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  )

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Transaksi Penukaran
      </Typography>

      <Paper className="p-6">
        <Typography variant="h6" className="mb-4">
          Transaksi Baru
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <ToggleButtonGroup
                    color="primary"
                    exclusive
                    fullWidth
                    value={field.value}
                    onChange={(_, value) => {
                      if (!value) return
                      field.onChange(value)
                      handleTypeChange(value)
                    }}
                  >
                    <ToggleButton value="buy">Beli dari Customer</ToggleButton>
                    <ToggleButton value="sell">Jual ke Customer</ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="currencyId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    label="Mata Uang"
                    {...field}
                    onChange={(e) => {
                      const id = Number(e.target.value)
                      field.onChange(id)
                      handleCurrencyChange(id)
                    }}
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
              <TextField
                fullWidth
                type="number"
                label="Nominal"
                error={!!errors.amount}
                helperText={errors.amount?.message}
                {...register('amount')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Kurs Default" value={rateDefault ?? ''} disabled />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Kurs Aktual (Nego)"
                error={!!errors.rateActual}
                helperText={errors.rateActual?.message}
                {...register('rateActual')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Total" value={formatRupiah(total)} disabled />
            </Grid>

            {total > REVIEW_THRESHOLD && (
              <Grid size={12}>
                <Alert severity="warning">
                  Transaksi ini melebihi batas Rp {REVIEW_THRESHOLD.toLocaleString('id-ID')} dan akan otomatis
                  ditandai "Perlu Review".
                </Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="customer"
                control={control}
                render={({ field }) => (
                  <CustomerSearchField
                    options={customerList}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.customer}
                    helperText={errors.customer?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button variant="outlined" fullWidth sx={{ height: '100%' }} onClick={() => setQuickAddOpen(true)}>
                + Nasabah Baru
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    label="Dilayani oleh"
                    error={!!errors.employeeId}
                    helperText={errors.employeeId?.message}
                    {...field}
                  >
                    {activeEmployees.map((e) => (
                      <MenuItem key={e.id} value={e.id}>
                        {e.name} — {e.position}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={12} className="flex justify-end gap-2">
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                disabled={!notaTransaction}
                onClick={() => setNotaOpen(true)}
              >
                Cetak Nota
              </Button>
              <Button type="submit" variant="contained">
                Simpan
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper className="p-6">
        <Typography variant="h6" className="mb-4">
          Riwayat Transaksi
        </Typography>
        <Grid container spacing={2} className="mb-4">
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Karyawan"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <MenuItem value="">Semua</MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.id} value={e.name}>
                  {e.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Mata Uang"
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
            >
              <MenuItem value="">Semua</MenuItem>
              {currencies.map((c) => (
                <MenuItem key={c.id} value={c.code}>
                  {c.code}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Tanggal"
              slotProps={{ inputLabel: { shrink: true } }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Customer"
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
            >
              <MenuItem value="">Semua</MenuItem>
              {customerList.map((c) => (
                <MenuItem key={c.id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12} className="flex justify-end">
            <Button size="small" onClick={handleResetFilters}>
              Reset Filter
            </Button>
          </Grid>
        </Grid>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>No. Transaksi</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Tipe</TableCell>
                <TableCell>Mata Uang</TableCell>
                <TableCell align="right">Nominal</TableCell>
                <TableCell align="right">Kurs</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Karyawan</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{t.transactionNumber}</TableCell>
                  <TableCell>{t.createdAt}</TableCell>
                  <TableCell>
                    <Chip
                      label={t.type === 'buy' ? 'Beli' : 'Jual'}
                      color={t.type === 'buy' ? 'success' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{t.currencyCode}</TableCell>
                  <TableCell align="right">{t.amount.toLocaleString('id-ID')}</TableCell>
                  <TableCell align="right">{t.rateActual.toLocaleString('id-ID')}</TableCell>
                  <TableCell align="right">{formatRupiah(t.totalAmount)}</TableCell>
                  <TableCell>{t.customerName}</TableCell>
                  <TableCell>{t.employeeName}</TableCell>
                  <TableCell>
                    {t.requiresReview && <Chip label="Perlu Review" color="warning" size="small" />}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Tidak ada transaksi yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredTransactions.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value))
            setPage(0)
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Baris per halaman"
        />
      </Paper>

      <CustomerQuickAddDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onAdd={handleCustomerAdded}
      />
      <NotaDialog open={notaOpen} onClose={() => setNotaOpen(false)} transaction={notaTransaction} />
    </div>
  )
}
