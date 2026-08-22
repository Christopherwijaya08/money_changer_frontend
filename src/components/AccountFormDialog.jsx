import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

const emptyForm = { name: '', email: '', role: 'admin', password: '' }

function buildSchema(isEditing) {
  return yup.object({
    name: yup.string().trim().required('Wajib diisi'),
    email: yup.string().trim().email('Format email tidak valid').required('Wajib diisi'),
    role: yup.string().oneOf(['admin', 'owner']).required(),
    password: isEditing
      ? yup.string().transform((v) => (v === '' ? undefined : v)).min(6, 'Minimal 6 karakter')
      : yup.string().required('Wajib diisi').min(6, 'Minimal 6 karakter'),
  })
}

export default function AccountFormDialog({ open, onClose, onSave, account = null }) {
  const isEditing = !!account

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm, resolver: yupResolver(buildSchema(isEditing)) })

  useEffect(() => {
    if (!open) return
    reset(account ? { name: account.name, email: account.email, role: account.role, password: '' } : emptyForm)
  }, [open, account, reset])

  function onSubmit(data) {
    const { password, ...rest } = data
    onSave({
      id: account?.id ?? Date.now(),
      isActive: account?.isActive ?? true,
      ...rest,
      // ponytail: password just discarded (mock, no real accounts) — kept only to validate the field
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Akun' : 'Tambah Akun'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} className="mt-1">
            <Grid size={12}>
              <TextField
                fullWidth
                label="Nama"
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register('email')}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField select fullWidth label="Peran" {...field}>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="owner">Owner</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label={isEditing ? 'Kata Sandi Baru (opsional)' : 'Kata Sandi'}
                type="password"
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Batal</Button>
          <Button type="submit" variant="contained">
            Simpan
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
