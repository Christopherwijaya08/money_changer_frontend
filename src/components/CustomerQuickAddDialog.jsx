import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import UploadFileIcon from '@mui/icons-material/UploadFile'

const emptyForm = { name: '', identityNumber: '', address: '', phone: '' }

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Wajib diisi'

  const identityDigits = form.identityNumber.replace(/\D/g, '')
  if (!form.identityNumber.trim()) errors.identityNumber = 'Wajib diisi'
  else if (identityDigits.length !== 16) errors.identityNumber = 'NIK harus 16 digit angka'

  const phoneDigits = form.phone.replace(/\D/g, '')
  if (!form.phone.trim()) errors.phone = 'Wajib diisi'
  else if (phoneDigits.length < 10 || phoneDigits.length > 13) errors.phone = 'Nomor HP harus 10-13 digit angka'

  return errors
}

export default function CustomerQuickAddDialog({ open, onClose, onAdd, customer = null }) {
  const [form, setForm] = useState(emptyForm)
  const [ktpPreview, setKtpPreview] = useState(null)
  const [errors, setErrors] = useState({})

  const isEditing = !!customer

  useEffect(() => {
    if (!open) return
    setForm(
      customer
        ? {
            name: customer.name,
            identityNumber: customer.identityNumber,
            phone: customer.phone,
            address: customer.address ?? '',
          }
        : emptyForm
    )
    setKtpPreview(customer?.ktpPhotoUrl ?? null)
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer])

  function handleField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (file) setKtpPreview(URL.createObjectURL(file))
  }

  function handleClose() {
    onClose()
  }

  function handleSubmit() {
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    onAdd({ id: customer?.id ?? Date.now(), ...form, ktpPhotoUrl: ktpPreview })
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Nasabah' : 'Nasabah Baru'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} className="mt-1">
          <Grid size={12}>
            <TextField
              fullWidth
              label="Nama"
              value={form.name}
              error={!!errors.name}
              helperText={errors.name}
              onChange={(e) => handleField('name', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Nomor Identitas (KTP)"
              value={form.identityNumber}
              error={!!errors.identityNumber}
              helperText={errors.identityNumber}
              onChange={(e) => handleField('identityNumber', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Nomor HP"
              value={form.phone}
              error={!!errors.phone}
              helperText={errors.phone}
              onChange={(e) => handleField('phone', e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Alamat"
              multiline
              minRows={2}
              value={form.address}
              onChange={(e) => handleField('address', e.target.value)}
            />
          </Grid>
          <Grid size={12} className="flex items-center gap-3">
            <Avatar variant="rounded" src={ktpPreview} sx={{ width: 64, height: 48 }}>
              KTP
            </Avatar>
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
              Upload Foto KTP
              <input type="file" accept="image/*" hidden onChange={handlePhoto} />
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Batal</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEditing ? 'Simpan' : 'Simpan & Gunakan'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
