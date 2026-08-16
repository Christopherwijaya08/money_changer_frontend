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

const emptyForm = { name: '', position: '' }

const schema = yup.object({
  name: yup.string().trim().required('Wajib diisi'),
  position: yup.string().trim().required('Wajib diisi'),
})

export default function EmployeeFormDialog({ open, onClose, onSave, employee = null }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm, resolver: yupResolver(schema) })

  const isEditing = !!employee

  useEffect(() => {
    if (!open) return
    reset(employee ? { name: employee.name, position: employee.position } : emptyForm)
  }, [open, employee, reset])

  function onSubmit(data) {
    onSave({ id: employee?.id ?? Date.now(), isActive: employee?.isActive ?? true, ...data })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Karyawan' : 'Tambah Karyawan'}</DialogTitle>
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
                label="Jabatan"
                error={!!errors.position}
                helperText={errors.position?.message}
                {...register('position')}
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
