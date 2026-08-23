import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import PaidIcon from '@mui/icons-material/Paid'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { apiClient } from '../api/apiClient'
import { mapTransaction } from '../api/mappers'
import { useBranch } from '../context/BranchContext'
import ReceiptDialog from '../components/ReceiptDialog'

function StatCard({ icon, label, value }) {
  return (
    <Paper className="p-6">
      <Box className="flex items-center gap-4">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: (theme) => `${theme.palette.primary.main}14`,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
          <Typography variant="h6" className="font-semibold">
            {value}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

function SummaryCards() {
  const { selectedBranchId, branches } = useBranch()
  const branchName = branches.find((b) => b.id === selectedBranchId)?.name
  const [summary, setSummary] = useState(null)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    if (!selectedBranchId) return
    let cancelled = false

    async function load() {
      try {
        const res = await apiClient.get('/dashboard/summary', { branch_id: selectedBranchId })
        if (!cancelled) setSummary(res)
      } catch (err) {
        if (!cancelled) setPageError(err.message ?? 'Gagal memuat ringkasan')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selectedBranchId])

  return (
    <div className="flex flex-col gap-2">
      <Typography variant="body2" color="text.secondary">
        Menampilkan ringkasan tanggal {summary?.date} untuk cabang: {branchName}
      </Typography>
      {pageError && <Alert severity="error">{pageError}</Alert>}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            icon={<PaidIcon />}
            label="Omzet Hari Ini"
            value={`Rp ${Number(summary?.omzet ?? 0).toLocaleString('id-ID')}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            icon={<ReceiptLongIcon />}
            label="Jumlah Transaksi Hari Ini"
            value={summary?.transaction_count ?? 0}
          />
        </Grid>
      </Grid>
    </div>
  )
}

const PERIOD_OPTIONS = [
  { value: 7, label: '7 Hari Terakhir' },
  { value: 14, label: '14 Hari Terakhir' },
  { value: 30, label: '30 Hari Terakhir' },
]

function TrendChart() {
  const { selectedBranchId } = useBranch()
  const [period, setPeriod] = useState(7)
  const [data, setData] = useState([])

  useEffect(() => {
    if (!selectedBranchId) return
    let cancelled = false

    async function load() {
      try {
        const res = await apiClient.get('/dashboard/trend', { branch_id: selectedBranchId, period })
        if (!cancelled) setData(res.data)
      } catch {
        if (!cancelled) setData([])
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selectedBranchId, period])

  const max = Math.max(...data.map((d) => Number(d.omzet)), 1)

  return (
    <Paper className="p-6">
      <Box className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <Typography variant="subtitle1" className="font-medium">
          Grafik Tren Transaksi (Omzet Harian)
        </Typography>
        <TextField
          select
          size="small"
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          sx={{ minWidth: 160 }}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 180 }}>
        {data.map((d) => {
          const total = Number(d.omzet)
          return (
            <Box
              key={d.date}
              sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, height: '100%' }}
            >
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                <Box
                  title={`${d.date}: Rp ${total.toLocaleString('id-ID')}`}
                  data-testid="trend-bar"
                  sx={{
                    width: '100%',
                    height: `${Math.max((total / max) * 100, 2)}%`,
                    bgcolor: 'primary.main',
                    borderRadius: '4px 4px 0 0',
                  }}
                />
              </Box>
              {period <= 7 && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>
                  {d.date.slice(5)}
                </Typography>
              )}
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}

function ReviewList() {
  const { selectedBranchId } = useBranch()
  const [needsReview, setNeedsReview] = useState([])

  useEffect(() => {
    if (!selectedBranchId) return
    let cancelled = false

    async function load() {
      try {
        const res = await apiClient.get('/transactions', {
          branch_id: selectedBranchId,
          requires_review: 1,
          per_page: 50,
        })
        if (!cancelled) setNeedsReview(res.data.map(mapTransaction))
      } catch {
        if (!cancelled) setNeedsReview([])
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selectedBranchId])

  return (
    <Paper className="p-6 h-full flex flex-col">
      <Box className="flex items-center justify-between mb-2">
        <Typography variant="subtitle1" className="font-medium">
          Transaksi Perlu Review
        </Typography>
        {needsReview.length > 0 && (
          <Chip label={needsReview.length} color="warning" size="small" />
        )}
      </Box>
      {needsReview.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          Tidak ada transaksi yang perlu direview.
        </Typography>
      ) : (
        <List dense disablePadding>
          {needsReview.map((t) => (
            <ListItem key={t.id} disableGutters divider>
              <ListItemText
                primary={`${t.transactionNumber} — ${t.customerName}`}
                secondary={`${t.currencyCode} ${t.amount.toLocaleString('id-ID')} · Rp ${t.totalAmount.toLocaleString('id-ID')} · ${t.createdAt}`}
              />
            </ListItem>
          ))}
        </List>
      )}
      <Button component={Link} to="/" size="small" className="self-start mt-2">
        Lihat Semua Transaksi
      </Button>
    </Paper>
  )
}

const RECENT_LIMIT = 5

function RecentTransactionsList() {
  const { selectedBranchId } = useBranch()
  const [recent, setRecent] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!selectedBranchId) return
    let cancelled = false

    async function load() {
      try {
        const res = await apiClient.get('/transactions', { branch_id: selectedBranchId, per_page: RECENT_LIMIT })
        if (!cancelled) setRecent(res.data.map(mapTransaction))
      } catch {
        if (!cancelled) setRecent([])
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selectedBranchId])

  return (
    <Paper className="p-6 h-full flex flex-col">
      <Typography variant="subtitle1" className="font-medium mb-2">
        Transaksi Terbaru
      </Typography>
      {recent.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          Belum ada transaksi untuk cabang ini.
        </Typography>
      ) : (
        <List dense disablePadding>
          {recent.map((t) => (
            <ListItem key={t.id} disableGutters divider disablePadding>
              <ListItemButton onClick={() => setSelected(t)}>
                <ListItemText
                  primary={`${t.transactionNumber} — ${t.customerName}`}
                  secondary={`${t.currencyCode} ${t.amount.toLocaleString('id-ID')} · Rp ${t.totalAmount.toLocaleString('id-ID')} · ${t.createdAt}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      <ReceiptDialog open={!!selected} onClose={() => setSelected(null)} transaction={selected} />
    </Paper>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Dashboard
      </Typography>

      <Grid container spacing={2}>
        <Grid size={12}>
          <SummaryCards />
        </Grid>
        <Grid size={12}>
          <TrendChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ReviewList />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RecentTransactionsList />
        </Grid>
      </Grid>
    </div>
  )
}
