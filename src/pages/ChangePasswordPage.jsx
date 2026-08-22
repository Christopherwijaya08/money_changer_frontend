import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'

const schema = yup.object({
  currentPassword: yup.string().required('Wajib diisi'),
  newPassword: yup.string().required('Wajib diisi').min(6, 'Minimal 6 karakter'),
  confirmPassword: yup
    .string()
    .required('Wajib diisi')
    .oneOf([yup.ref('newPassword')], 'Konfirmasi kata sandi tidak cocok'),
})

export default function ChangePasswordPage() {
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    resolver: yupResolver(schema),
  })

  function onSubmit() {
    // ponytail: no real credential store yet (Fase 5 backend); just confirms the flow works
    setSaved(true)
    reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Ganti Kata Sandi
      </Typography>

      <Paper className="p-6 max-w-md">
        {saved && (
          <Alert severity="success" className="mb-4" onClose={() => setSaved(false)}>
            Kata sandi berhasil diubah.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Kata Sandi Saat Ini"
                type="password"
                autoComplete="current-password"
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
                {...register('currentPassword')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Kata Sandi Baru"
                type="password"
                autoComplete="new-password"
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                {...register('newPassword')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Konfirmasi Kata Sandi Baru"
                type="password"
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                {...register('confirmPassword')}
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
