import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Chip from '@mui/material/Chip'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { transactions } from '../mocks/data'

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export default function ReviewTransactionsPage() {
  const reviewTransactions = useMemo(
    () => transactions.filter((t) => t.requiresReview).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    []
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button component={Link} to="/nasabah" startIcon={<ArrowBackIcon />} size="small">
          Kembali ke Nasabah
        </Button>
      </div>
      <Typography variant="h5" component="h1" className="font-medium">
        Transaksi Perlu Review
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Transaksi dengan nominal di atas batas alert (APU-PPT) yang perlu ditinjau admin/owner.
      </Typography>

      <Paper className="p-6">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>No. Transaksi</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Tipe</TableCell>
                <TableCell>Mata Uang</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Karyawan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviewTransactions.map((t) => (
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
                  <TableCell align="right">{formatRupiah(t.totalAmount)}</TableCell>
                  <TableCell>{t.customerName}</TableCell>
                  <TableCell>{t.employeeName}</TableCell>
                </TableRow>
              ))}
              {reviewTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Tidak ada transaksi yang perlu direview.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
}
