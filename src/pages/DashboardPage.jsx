import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import PaidIcon from '@mui/icons-material/Paid'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { transactions } from '../mocks/data'
import { useBranch } from '../context/BranchContext'

function SectionPlaceholder({ title, minHeight }) {
  return (
    <Paper className="p-6" sx={{ minHeight }}>
      <Typography variant="subtitle1" className="font-medium">
        {title}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Akan tersedia di sini.
      </Typography>
    </Paper>
  )
}

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

  const latestDate = transactions.reduce(
    (max, t) => (t.createdAt.slice(0, 10) > max ? t.createdAt.slice(0, 10) : max),
    ''
  )

  const todayTransactions = transactions.filter(
    (t) => t.branchId === selectedBranchId && t.createdAt.startsWith(latestDate)
  )

  const omzet = todayTransactions.reduce((sum, t) => sum + t.totalAmount, 0)

  return (
    <div className="flex flex-col gap-2">
      <Typography variant="body2" color="text.secondary">
        Menampilkan ringkasan tanggal {latestDate} untuk cabang: {branchName}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            icon={<PaidIcon />}
            label="Omzet Hari Ini"
            value={`Rp ${omzet.toLocaleString('id-ID')}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            icon={<ReceiptLongIcon />}
            label="Jumlah Transaksi Hari Ini"
            value={todayTransactions.length}
          />
        </Grid>
      </Grid>
    </div>
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
          <SectionPlaceholder title="Grafik Tren Transaksi" minHeight={260} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionPlaceholder title="Transaksi Perlu Review" minHeight={260} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionPlaceholder title="Transaksi Terbaru" minHeight={260} />
        </Grid>
      </Grid>
    </div>
  )
}
