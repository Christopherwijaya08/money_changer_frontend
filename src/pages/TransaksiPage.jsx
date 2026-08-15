import { useEffect, useMemo, useState } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import PrintIcon from '@mui/icons-material/Print'
import { currencies, customers as initialCustomers, employees, transactions as initialTransactions } from '../mocks/data'
import CustomerQuickAddDialog from '../components/CustomerQuickAddDialog'
import NotaDialog from '../components/NotaDialog'

const REVIEW_THRESHOLD = 50000000

const customerFilterOptions = createFilterOptions({
  stringify: (c) => `${c.name} ${c.identityNumber} ${c.phone}`,
})

const activeEmployees = employees.filter((e) => e.isActive)

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export default function TransaksiPage() {
  const [type, setType] = useState('buy')
  const [currencyId, setCurrencyId] = useState(currencies[0].id)
  const [amount, setAmount] = useState('')
  const [rateActual, setRateActual] = useState(currencies[0].rateBuy)
  const [customer, setCustomer] = useState(null)
  const [employeeId, setEmployeeId] = useState('')
  const [errors, setErrors] = useState({})

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

  const selectedCurrency = currencies.find((c) => c.id === currencyId)
  const rateDefault = type === 'buy' ? selectedCurrency?.rateBuy : selectedCurrency?.rateSell
  const total = (Number(amount) || 0) * (Number(rateActual) || 0)

  function handleCurrencyChange(id) {
    setCurrencyId(id)
    const c = currencies.find((cur) => cur.id === id)
    setRateActual(type === 'buy' ? c.rateBuy : c.rateSell)
  }

  function handleTypeChange(_, value) {
    if (!value) return
    setType(value)
    setRateActual(value === 'buy' ? selectedCurrency.rateBuy : selectedCurrency.rateSell)
  }

  function handleCustomerAdded(newCustomer) {
    setCustomerList((list) => [...list, newCustomer])
    setCustomer(newCustomer)
  }

  function handleSave() {
    const nextErrors = {}
    if (!amount || Number(amount) <= 0) nextErrors.amount = 'Nominal harus lebih dari 0'
    if (!rateActual || Number(rateActual) <= 0) nextErrors.rateActual = 'Kurs harus lebih dari 0'
    if (!customer) nextErrors.customer = 'Pilih customer'
    if (!employeeId) nextErrors.employeeId = 'Pilih karyawan'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const employee = employees.find((e) => e.id === employeeId)
    const now = new Date()
    const newTransaction = {
      id: Date.now(),
      transactionNumber: `TRX-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(transactions.length + 1).padStart(3, '0')}`,
      type,
      currencyCode: selectedCurrency.code,
      amount: Number(amount),
      rateActual: Number(rateActual),
      totalAmount: total,
      customerName: customer.name,
      employeeName: employee.name,
      requiresReview: total > REVIEW_THRESHOLD,
      createdAt: now.toISOString().slice(0, 16).replace('T', ' '),
    }

    setTransactions((list) => [newTransaction, ...list])
    setNotaTransaction(newTransaction)
    setNotaOpen(true)
    setAmount('')
    setCustomer(null)
    setEmployeeId('')
    setErrors({})
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
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <ToggleButtonGroup color="primary" exclusive fullWidth value={type} onChange={handleTypeChange}>
              <ToggleButton value="buy">Beli dari Customer</ToggleButton>
              <ToggleButton value="sell">Jual ke Customer</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              fullWidth
              label="Mata Uang"
              value={currencyId}
              onChange={(e) => handleCurrencyChange(Number(e.target.value))}
            >
              {currencies.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.code}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Nominal"
              value={amount}
              error={!!errors.amount}
              helperText={errors.amount}
              onChange={(e) => setAmount(e.target.value)}
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
              value={rateActual}
              error={!!errors.rateActual}
              helperText={errors.rateActual}
              onChange={(e) => setRateActual(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label="Total" value={formatRupiah(total)} disabled />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={customerList}
              filterOptions={customerFilterOptions}
              getOptionLabel={(c) => `${c.name} — ${c.identityNumber}`}
              renderOption={(props, c) => (
                <li {...props} key={c.id}>
                  <div className="flex flex-col">
                    <span>{c.name}</span>
                    <span className="text-xs text-gray-500">
                      {c.identityNumber} · {c.phone}
                    </span>
                  </div>
                </li>
              )}
              value={customer}
              onChange={(_, value) => setCustomer(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer"
                  placeholder="Cari nama, no. identitas, atau no. HP..."
                  error={!!errors.customer}
                  helperText={errors.customer}
                />
              )}
              noOptionsText="Nasabah tidak ditemukan — klik + Nasabah Baru"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Button variant="outlined" fullWidth sx={{ height: '100%' }} onClick={() => setQuickAddOpen(true)}>
              + Nasabah Baru
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              select
              fullWidth
              label="Dilayani oleh"
              value={employeeId}
              error={!!errors.employeeId}
              helperText={errors.employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              {activeEmployees.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name} — {e.position}
                </MenuItem>
              ))}
            </TextField>
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
            <Button variant="contained" onClick={handleSave}>
              Simpan
            </Button>
          </Grid>
        </Grid>
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
