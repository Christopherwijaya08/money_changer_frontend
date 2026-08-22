import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useThousandSeparator } from '../hooks/useThousandSeparator'

const DEFAULT_THRESHOLD = 50000000

const schema = yup.object({
  threshold: yup
    .number()
    .typeError('Batas nominal harus lebih dari 0')
    .positive('Batas nominal harus lebih dari 0')
    .required('Batas nominal harus lebih dari 0'),
})

export default function ThresholdSettingsPage() {
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD)
  const [saved, setSaved] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { threshold: DEFAULT_THRESHOLD }, resolver: yupResolver(schema) })

  function onSubmit(data) {
    setThreshold(Number(data.threshold))
    setSaved(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button component={Link} to="/customers" startIcon={<ArrowBackIcon />} size="small">
          Kembali ke Nasabah
        </Button>
      </div>
      <Typography variant="h5" component="h1" className="font-medium">
        Pengaturan Threshold Alert Transaksi Besar
      </Typography>

      <Paper className="p-6 max-w-lg">
        <Typography variant="body2" color="text.secondary" className="mb-4">
          Transaksi dengan total nominal di atas batas ini akan otomatis ditandai "Perlu Review" untuk
          kepatuhan APU-PPT.
        </Typography>

        {saved && (
          <Alert severity="success" className="mb-4" onClose={() => setSaved(false)}>
            Batas nominal berhasil disimpan: Rp {threshold.toLocaleString('id-ID')}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '16px' }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller
                name="threshold"
                control={control}
                render={({ field }) => {
                  const [display, handleChange] = useThousandSeparator(field.value, field.onChange)
                  return (
                    <TextField
                      fullWidth
                      inputMode="numeric"
                      label="Batas Nominal (Rp)"
                      error={!!errors.threshold}
                      helperText={errors.threshold?.message}
                      value={display}
                      onChange={handleChange}
                    />
                  )
                }}
              />
            </Grid>
            <Grid size={12} className="flex justify-end">
              <Button type="submit" variant="contained">
                Simpan
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  )
}
