import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
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
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import PrintIcon from '@mui/icons-material/Print'
import { apiClient } from '../api/apiClient'
import { mapCustomer, mapEmployee, mapTransaction } from '../api/mappers'
import CustomerQuickAddDialog from '../components/CustomerQuickAddDialog'
import CustomerSearchField from '../components/CustomerSearchField'
import ReceiptDialog from '../components/ReceiptDialog'
import { useBranch } from '../context/BranchContext'
import { useAuth } from '../context/AuthContext'
import { useThousandSeparator } from '../hooks/useThousandSeparator'

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function mapCurrency(currency, rateByCurrencyId) {
  const rate = rateByCurrencyId[currency.id]
  return {
    id: currency.id,
    code: currency.code,
    isActive: currency.is_active,
    rateBuy: Number(rate?.rate_buy ?? 0),
    rateSell: Number(rate?.rate_sell ?? 0),
  }
}

const emptyFormValues = {
  type: 'buy',
  currencyId: '',
  amount: '',
  rateActual: '',
  customer: null,
  employeeId: '',
}

const transactionSchema = yup.object({
  type: yup.string().required(),
  currencyId: yup.number().required('Pilih mata uang'),
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

export default function TransactionPage() {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyFormValues, resolver: yupResolver(transactionSchema) })

  const { branches, selectedBranchId } = useBranch()
  const { userId } = useAuth()
  const selectedBranchName = branches.find((b) => b.id === selectedBranchId)?.name

  const [currencies, setCurrencies] = useState([])
  const [employees, setEmployees] = useState([])
  const [customerList, setCustomerList] = useState([])
  const [reviewThreshold, setReviewThreshold] = useState(50000000)
  const [referenceLoading, setReferenceLoading] = useState(true)
  const [referenceError, setReferenceError] = useState('')

  const [transactions, setTransactions] = useState([])
  const [totalTransactions, setTotalTransactions] = useState(0)

  const [submitError, setSubmitError] = useState('')
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [receiptTransaction, setReceiptTransaction] = useState(null)
  const [receiptOpen, setReceiptOpen] = useState(false)

  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterCurrency, setFilterCurrency] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [filterReviewOnly, setFilterReviewOnly] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  function handleResetFilters() {
    setFilterEmployee('')
    setFilterCurrency('')
    setFilterDate('')
    setFilterCustomer('')
    setFilterReviewOnly(false)
    setPage(0)
  }

  useEffect(() => {
    let cancelled = false

    async function loadReferenceData() {
      try {
        const [currenciesRes, ratesRes, employeesRes, customersRes, thresholdRes] = await Promise.all([
          apiClient.get('/currencies'),
          apiClient.get('/exchange-rates'),
          apiClient.get('/employees', { active_only: true }),
          apiClient.get('/customers'),
          apiClient.get('/settings/threshold'),
        ])
        if (cancelled) return

        const rateByCurrencyId = Object.fromEntries(ratesRes.data.map((r) => [r.currency_id, r]))
        const loadedCurrencies = currenciesRes.data.map((c) => mapCurrency(c, rateByCurrencyId))
        const firstActive = loadedCurrencies.find((c) => c.isActive)

        setCurrencies(loadedCurrencies)
        setEmployees(employeesRes.data.map(mapEmployee))
        setCustomerList(customersRes.data.map(mapCustomer))
        setReviewThreshold(Number(thresholdRes.data.review_threshold))

        if (firstActive) {
          reset({
            ...emptyFormValues,
            currencyId: firstActive.id,
            rateActual: firstActive.rateBuy,
          })
        }
      } catch (err) {
        if (!cancelled) setReferenceError(err.message ?? 'Gagal memuat data referensi')
      } finally {
        if (!cancelled) setReferenceLoading(false)
      }
    }

    loadReferenceData()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchTransactions() {
    try {
      const res = await apiClient.get('/transactions', {
        branch_id: selectedBranchId,
        employee_id: filterEmployee || undefined,
        currency_id: filterCurrency || undefined,
        customer_id: filterCustomer || undefined,
        date: filterDate || undefined,
        requires_review: filterReviewOnly ? 1 : undefined,
        page: page + 1,
        per_page: rowsPerPage,
      })
      setTransactions(res.data.map(mapTransaction))
      setTotalTransactions(res.meta.total)
    } catch (err) {
      setSubmitError(err.message ?? 'Gagal memuat riwayat transaksi')
    }
  }

  useEffect(() => {
    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, filterEmployee, filterCurrency, filterCustomer, filterDate, filterReviewOnly, page, rowsPerPage])

  useEffect(() => {
    setPage(0)
  }, [selectedBranchId, filterEmployee, filterCurrency, filterCustomer, filterDate, filterReviewOnly])

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

  async function handleCustomerAdded(newCustomer) {
    const fields = {
      name: newCustomer.name,
      identity_number: newCustomer.identityNumber,
      phone: newCustomer.phone,
      address: newCustomer.address || '',
    }

    let body
    if (newCustomer.idPhotoFile) {
      body = new FormData()
      Object.entries(fields).forEach(([key, value]) => body.append(key, value))
      body.append('ktp_photo', newCustomer.idPhotoFile)
    } else {
      body = fields
    }

    try {
      setSubmitError('')
      const res = await apiClient.post('/customers', body)
      const created = mapCustomer(res.data)
      setCustomerList((list) => [created, ...list])
      setValue('customer', created)
    } catch (err) {
      setSubmitError(err.message ?? 'Gagal menyimpan nasabah baru')
    }
  }

  async function onSubmit(data) {
    try {
      setSubmitError('')
      const res = await apiClient.post('/transactions', {
        branch_id: selectedBranchId,
        type: data.type,
        currency_id: data.currencyId,
        amount: Number(data.amount),
        rate_default: rateDefault,
        rate_actual: Number(data.rateActual),
        customer_id: data.customer.id,
        employee_id: data.employeeId,
        user_id: userId,
      })
      const created = mapTransaction(res.data)
      setReceiptTransaction(created)
      setReceiptOpen(true)
      reset({ ...data, amount: '', customer: null, employeeId: '' })
      fetchTransactions()
    } catch (err) {
      setSubmitError(err.message ?? 'Gagal menyimpan transaksi')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Transaksi Penukaran
      </Typography>

      {(referenceError || submitError) && (
        <Alert severity="error" onClose={() => (referenceError ? setReferenceError('') : setSubmitError(''))}>
          {referenceError || submitError}
        </Alert>
      )}

      <Paper className="p-6">
        <Typography variant="h6" className="mb-4">
          Transaksi Baru
        </Typography>
        {referenceLoading ? (
          <Typography color="text.secondary">Memuat data transaksi...</Typography>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={8}>
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
                      {currencies
                        .filter((c) => c.isActive)
                        .map((c) => (
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
                        slotProps={{
                          input: {
                            endAdornment: selectedCurrency && (
                              <InputAdornment position="end">{selectedCurrency.code}</InputAdornment>
                            ),
                          },
                        }}
                      />
                    )
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Kurs Default"
                  value={rateDefault ? rateDefault.toLocaleString('id-ID') : ''}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="rateActual"
                  control={control}
                  render={({ field }) => {
                    const [display, handleChange] = useThousandSeparator(field.value, field.onChange)
                    return (
                      <TextField
                        fullWidth
                        inputMode="numeric"
                        label="Kurs Aktual (Nego)"
                        error={!!errors.rateActual}
                        helperText={errors.rateActual?.message}
                        value={display}
                        onChange={handleChange}
                      />
                    )
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Total" value={formatRupiah(total)} disabled />
              </Grid>

              {total > reviewThreshold && (
                <Grid size={12}>
                  <Alert severity="warning">
                    Transaksi ini melebihi batas Rp {reviewThreshold.toLocaleString('id-ID')} dan akan otomatis
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
                      {employees.map((e) => (
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
                  disabled={!receiptTransaction}
                  onClick={() => setReceiptOpen(true)}
                >
                  Cetak Nota
                </Button>
                <Button type="submit" variant="contained">
                  Simpan
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>

      <Paper className="p-6">
        <div className="mb-4">
          <Typography variant="h6">
            Riwayat Transaksi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Menampilkan transaksi untuk cabang: {selectedBranchName}
          </Typography>
        </div>
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
                <MenuItem key={e.id} value={e.id}>
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
                <MenuItem key={c.id} value={c.id}>
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
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12} className="flex items-center justify-between">
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={filterReviewOnly}
                  onChange={(e) => setFilterReviewOnly(e.target.checked)}
                />
              }
              label="Perlu Review"
            />
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
              {transactions.map((t) => (
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
              {transactions.length === 0 && (
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
          count={totalTransactions}
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
      <ReceiptDialog open={receiptOpen} onClose={() => setReceiptOpen(false)} transaction={receiptTransaction} />
    </div>
  )
}
