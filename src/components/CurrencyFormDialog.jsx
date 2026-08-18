import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

const emptyForm = { code: '', name: '' }

const schema = yup.object({
  code: yup
    .string()
    .trim()
    .required('Wajib diisi')
    .matches(/^[A-Za-z]{3}$/, 'Kode mata uang harus 3 huruf, contoh: USD'),
  name: yup.string().trim(),
})

export default function CurrencyFormDialog({ open, onClose, onSave, currency = null }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm, resolver: yupResolver(schema) })

  const isEditing = !!currency

  useEffect(() => {
    if (!open) return
    reset(currency ? { code: currency.code, name: currency.name } : emptyForm)
  }, [open, currency, reset])

  function onSubmit(data) {
    onSave({
      id: currency?.id ?? Date.now(),
      isActive: currency?.isActive ?? true,
      ...data,
      code: data.code.toUpperCase(),
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Mata Uang' : 'Tambah Mata Uang'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} className="mt-1">
            <Grid size={12}>
              <TextField
                fullWidth
                label="Kode Mata Uang"
                placeholder="USD"
                disabled={isEditing}
                error={!!errors.code}
                helperText={errors.code?.message ?? (isEditing ? 'Kode tidak bisa diubah' : undefined)}
                {...register('code')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Nama Mata Uang"
                placeholder="Dolar Amerika Serikat"
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name')}
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
