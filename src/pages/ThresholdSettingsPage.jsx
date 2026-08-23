import { useEffect, useState } from 'react'
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
import { apiClient } from '../api/apiClient'
import { useAuth } from '../context/AuthContext'
import { useThousandSeparator } from '../hooks/useThousandSeparator'

const schema = yup.object({
  threshold: yup
    .number()
    .typeError('Batas nominal harus lebih dari 0')
    .positive('Batas nominal harus lebih dari 0')
    .required('Batas nominal harus lebih dari 0'),
})

export default function ThresholdSettingsPage() {
  const { userId } = useAuth()
  const [threshold, setThreshold] = useState(null)
  const [saved, setSaved] = useState(false)
  const [pageError, setPageError] = useState('')

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { threshold: '' }, resolver: yupResolver(schema) })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await apiClient.get('/settings/threshold')
        if (cancelled) return
        const value = Number(res.data.review_threshold)
        setThreshold(value)
        reset({ threshold: value })
      } catch (err) {
        if (!cancelled) setPageError(err.message ?? 'Gagal memuat pengaturan threshold')
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(data) {
    try {
      setPageError('')
      const res = await apiClient.put('/settings/threshold', {
        review_threshold: Number(data.threshold),
        user_id: userId,
      })
      setThreshold(Number(res.data.review_threshold))
      setSaved(true)
    } catch (err) {
      setPageError(err.message ?? 'Gagal menyimpan threshold')
    }
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

        {pageError && (
          <Alert severity="error" className="mb-4" onClose={() => setPageError('')}>
            {pageError}
          </Alert>
        )}
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
