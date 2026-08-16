import { useEffect, useState } from 'react'
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
import IdPhotoUpload from './IdPhotoUpload'

const emptyForm = { name: '', identityNumber: '', address: '', phone: '' }

const customerSchema = yup.object({
  name: yup.string().trim().required('Wajib diisi'),
  identityNumber: yup
    .string()
    .trim()
    .required('Wajib diisi')
    .test('nik-16-digit', 'NIK harus 16 digit angka', (v) => (v ?? '').replace(/\D/g, '').length === 16),
  phone: yup
    .string()
    .trim()
    .required('Wajib diisi')
    .test('phone-10-13-digit', 'Nomor HP harus 10-13 digit angka', (v) => {
      const digits = (v ?? '').replace(/\D/g, '').length
      return digits >= 10 && digits <= 13
    }),
  address: yup.string(),
})

export default function CustomerQuickAddDialog({ open, onClose, onAdd, customer = null }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm, resolver: yupResolver(customerSchema) })
  const [idPreview, setIdPreview] = useState(null)

  const isEditing = !!customer

  useEffect(() => {
    if (!open) return
    reset(
      customer
        ? {
            name: customer.name,
            identityNumber: customer.identityNumber,
            phone: customer.phone,
            address: customer.address ?? '',
          }
        : emptyForm
    )
    setIdPreview(customer?.idPhotoUrl ?? null)
  }, [open, customer, reset])

  function handleClose() {
    onClose()
  }

  function onSubmit(data) {
    onAdd({ id: customer?.id ?? Date.now(), ...data, idPhotoUrl: idPreview })
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Nasabah' : 'Nasabah Baru'}</DialogTitle>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nomor Identitas (KTP)"
                error={!!errors.identityNumber}
                helperText={errors.identityNumber?.message}
                {...register('identityNumber')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nomor HP"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                {...register('phone')}
              />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Alamat" multiline minRows={2} {...register('address')} />
            </Grid>
            <Grid size={12}>
              <IdPhotoUpload value={idPreview} onChange={setIdPreview} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Batal</Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Simpan' : 'Simpan & Gunakan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
