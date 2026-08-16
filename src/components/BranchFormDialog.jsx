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

const emptyForm = { name: '', address: '' }

const schema = yup.object({
  name: yup.string().trim().required('Wajib diisi'),
  address: yup.string().trim().required('Wajib diisi'),
})

export default function BranchFormDialog({ open, onClose, onSave, branch = null }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm, resolver: yupResolver(schema) })

  const isEditing = !!branch

  useEffect(() => {
    if (!open) return
    reset(branch ? { name: branch.name, address: branch.address } : emptyForm)
  }, [open, branch, reset])

  function onSubmit(data) {
    onSave({ id: branch?.id ?? Date.now(), isActive: branch?.isActive ?? true, ...data })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Cabang' : 'Tambah Cabang'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} className="mt-1">
            <Grid size={12}>
              <TextField
                fullWidth
                label="Nama Cabang"
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Alamat"
                multiline
                minRows={2}
                error={!!errors.address}
                helperText={errors.address?.message}
                {...register('address')}
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
