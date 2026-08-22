import { useEffect, useMemo, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableSortLabel from '@mui/material/TableSortLabel'
import TableContainer from '@mui/material/TableContainer'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import { transactions } from '../mocks/data'
import KtpPhotoAvatar from './KtpPhotoAvatar'

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export default function CustomerDetailDialog({ open, onClose, customer }) {
  const [filterCurrency, setFilterCurrency] = useState('')
  const [filterType, setFilterType] = useState('')
  const [orderBy, setOrderBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')

  useEffect(() => {
    if (!open) return
    setFilterCurrency('')
    setFilterType('')
    setOrderBy('createdAt')
    setOrder('desc')
  }, [open, customer])

  const history = useMemo(() => {
    if (!customer) return []
    return transactions.filter((t) => t.customerName === customer.name)
  }, [customer])

  const currencyOptions = useMemo(() => [...new Set(history.map((t) => t.currencyCode))], [history])

  const visibleHistory = useMemo(() => {
    const filtered = history.filter((t) => {
      if (filterCurrency && t.currencyCode !== filterCurrency) return false
      if (filterType && t.type !== filterType) return false
      return true
    })
    const sorted = [...filtered].sort((a, b) => {
      const cmp = orderBy === 'total' ? a.totalAmount - b.totalAmount : a.createdAt.localeCompare(b.createdAt)
      return order === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [history, filterCurrency, filterType, orderBy, order])

  function handleSort(field) {
    if (orderBy === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setOrderBy(field)
      setOrder('asc')
    }
  }

  if (!customer) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detail Nasabah</DialogTitle>
      <DialogContent>
        <div className="flex gap-4 mb-4">
          <KtpPhotoAvatar src={customer.idPhotoUrl} sx={{ width: 120, height: 90 }} />
          <div className="flex flex-col gap-0.5">
            <Typography variant="h6">{customer.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              No. Identitas: {customer.identityNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No. HP: {customer.phone}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Alamat: {customer.address || '-'}
            </Typography>
          </div>
        </div>

        <Divider className="mb-4" />

        <div className="flex items-center justify-between mb-2">
          <Typography variant="subtitle1">Riwayat Transaksi</Typography>
          <div className="flex gap-2">
            <TextField
              select
              size="small"
              label="Tipe"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">Semua</MenuItem>
              <MenuItem value="buy">Beli</MenuItem>
              <MenuItem value="sell">Jual</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Mata Uang"
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">Semua</MenuItem>
              {currencyOptions.map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </div>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>No. Transaksi</TableCell>
                <TableCell sortDirection={orderBy === 'createdAt' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? order : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Tanggal
                  </TableSortLabel>
                </TableCell>
                <TableCell>Tipe</TableCell>
                <TableCell>Mata Uang</TableCell>
                <TableCell align="right">Nominal</TableCell>
                <TableCell align="right" sortDirection={orderBy === 'total' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'total'}
                    direction={orderBy === 'total' ? order : 'asc'}
                    onClick={() => handleSort('total')}
                  >
                    Total
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleHistory.map((t) => (
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
                  <TableCell align="right">{formatRupiah(t.totalAmount)}</TableCell>
                  <TableCell>
                    {t.requiresReview && <Chip label="Perlu Review" color="warning" size="small" />}
                  </TableCell>
                </TableRow>
              ))}
              {visibleHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {history.length === 0
                      ? 'Belum ada transaksi untuk nasabah ini.'
                      : 'Tidak ada transaksi yang cocok dengan filter.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Tutup</Button>
      </DialogActions>
    </Dialog>
  )
}
