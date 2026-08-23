import { useEffect, useState } from 'react'
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
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import { apiClient } from '../api/apiClient'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/formatDateTime'

const ACTION_TYPES = {
  login: { label: 'Login', color: 'default' },
  exchange_rate: { label: 'Perubahan Kurs', color: 'info' },
  transaction_edit: { label: 'Edit Transaksi', color: 'warning' },
  transaction_delete: { label: 'Hapus Transaksi', color: 'error' },
}

function mapLog(l) {
  return {
    id: l.id,
    type: l.action,
    user: l.user_name,
    detail: l.description,
    createdAt: formatDateTime(l.created_at),
  }
}

export default function AuditLogPage() {
  const { role } = useAuth()
  const [filterType, setFilterType] = useState('')
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    if (role !== 'owner') return
    let cancelled = false

    async function load() {
      try {
        const res = await apiClient.get('/audit-logs', {
          action: filterType || undefined,
          page: page + 1,
          per_page: rowsPerPage,
        })
        if (cancelled) return
        setLogs(res.data.map(mapLog))
        setTotal(res.meta.total)
      } catch (err) {
        if (!cancelled) setPageError(err.message ?? 'Gagal memuat audit log')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [role, filterType, page, rowsPerPage])

  if (role !== 'owner') {
    return <Navigate to="/" replace />
  }

  function handleFilterChange(value) {
    setFilterType(value)
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Audit Log
      </Typography>

      {pageError && (
        <Alert severity="error" onClose={() => setPageError('')}>
          {pageError}
        </Alert>
      )}

      <Paper className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <TextField
            select
            size="small"
            label="Jenis Aktivitas"
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value)}
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
            <Button size="small" onClick={() => handleFilterChange('')}>
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
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{log.createdAt}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <Chip
                      label={ACTION_TYPES[log.type]?.label ?? log.type}
                      color={ACTION_TYPES[log.type]?.color ?? 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.detail}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Tidak ada aktivitas yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value))
            setPage(0)
          }}
          rowsPerPageOptions={[15, 25, 50]}
          labelRowsPerPage="Baris per halaman"
        />
      </Paper>
    </div>
  )
}
