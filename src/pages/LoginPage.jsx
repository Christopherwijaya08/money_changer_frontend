import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Navigate, useLocation } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { apiClient } from '../api/apiClient'
import { useAuth } from '../context/AuthContext'

const schema = yup.object({
  email: yup.string().email('Format email tidak valid').required('Email wajib diisi'),
  password: yup.string().required('Kata sandi wajib diisi').min(6, 'Kata sandi minimal 6 karakter'),
})

export default function LoginPage() {
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' }, resolver: yupResolver(schema) })

  // Single redirect point: covers both "just logged in" (login() flips this
  // on the next render) and "already had a session, visited /login directly".
  if (isAuthenticated) {
    return <Navigate to={location.state?.from ?? '/'} replace />
  }

  async function onSubmit(data) {
    try {
      const res = await apiClient.post('/login', data)
      login(res.token, res.user)
    } catch (err) {
      setError('root', { message: err.errors?.email?.[0] ?? err.message ?? 'Email atau kata sandi salah.' })
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper className="p-8 w-full" sx={{ maxWidth: 400 }}>
        <Typography variant="h5" component="h1" className="font-medium mb-1">
          Money Changer
        </Typography>
        <Typography color="text.secondary" variant="body2" className="mb-6">
          Masuk untuk mengelola transaksi dan data toko.
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
          <TextField
            fullWidth
            label="Email"
            type="email"
            autoComplete="username"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email')}
          />
          <TextField
            fullWidth
            label="Kata Sandi"
            type="password"
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            Masuk
          </Button>
        </form>
      </Paper>
    </Box>
  )
}
