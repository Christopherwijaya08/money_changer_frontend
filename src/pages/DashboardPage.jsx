import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'

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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Dashboard
      </Typography>

      <Grid container spacing={2}>
        <Grid size={12}>
          <SectionPlaceholder title="Ringkasan Omzet & Jumlah Transaksi" minHeight={100} />
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
