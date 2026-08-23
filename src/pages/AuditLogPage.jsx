import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Chip from '@mui/material/Chip'
import { useAuth } from '../context/AuthContext'

const ACTION_TYPES = {
  login: { label: 'Login', color: 'default' },
  exchange_rate: { label: 'Perubahan Kurs', color: 'info' },
  transaction_edit: { label: 'Edit Transaksi', color: 'warning' },
  transaction_delete: { label: 'Hapus Transaksi', color: 'error' },
}

// ponytail: mock data for this task — wired to a real /audit-logs endpoint in the
// integration task that follows (mirrors every other feature this session).
const mockLogs = [
  {
    id: 1,
    type: 'login',
    user: 'Siti Rahayu',
    detail: 'Login berhasil',
    createdAt: '2026-08-23 08:02',
  },
  {
    id: 2,
    type: 'login',
    user: 'Budi Hartono',
    detail: 'Login berhasil',
    createdAt: '2026-08-23 08:05',
  },
  {
    id: 3,
    type: 'exchange_rate',
    user: 'Budi Hartono',
    detail: 'USD: kurs beli 15.700 → 15.750, kurs jual 15.800 → 15.850',
    createdAt: '2026-08-23 08:10',
  },
  {
    id: 4,
    type: 'transaction_edit',
    user: 'Budi Hartono',
    detail: 'TRX-20260823-001: kurs aktual 16.900 → 16.950',
    createdAt: '2026-08-23 09:12',
  },
  {
    id: 5,
    type: 'transaction_delete',
    user: 'Siti Rahayu',
    detail: 'TRX-20260822-004 dihapus (salah input nominal)',
    createdAt: '2026-08-22 16:40',
  },
  {
    id: 6,
    type: 'login',
    user: 'Budi Hartono',
    detail: 'Login berhasil',
    createdAt: '2026-08-22 08:00',
  },
]

export default function AuditLogPage() {
  const { role } = useAuth()
  const [filterType, setFilterType] = useState('')

  if (role !== 'owner') {
    return <Navigate to="/" replace />
  }

  const filteredLogs = mockLogs
    .filter((log) => !filterType || log.type === filterType)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Audit Log
      </Typography>

      <Paper className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <TextField
            select
            size="small"
            label="Jenis Aktivitas"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Semua</MenuItem>
            {Object.entries(ACTION_TYPES).map(([value, { label }]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          {filterType && (
            <Button size="small" onClick={() => setFilterType('')}>
              Reset Filter
            </Button>
          )}
        </div>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Waktu</TableCell>
                <TableCell>Pengguna</TableCell>
                <TableCell>Aktivitas</TableCell>
                <TableCell>Detail</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{log.createdAt}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <Chip
                      label={ACTION_TYPES[log.type].label}
                      color={ACTION_TYPES[log.type].color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.detail}</TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Tidak ada aktivitas yang cocok dengan filter.
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
