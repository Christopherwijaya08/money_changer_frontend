import { useMemo, useState } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import EditIcon from '@mui/icons-material/Edit'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import { employees as initialEmployees } from '../mocks/data'
import EmployeeFormDialog from '../components/EmployeeFormDialog'

export default function MasterKaryawanPage() {
  const [employees, setEmployees] = useState(initialEmployees)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [deactivatingEmployee, setDeactivatingEmployee] = useState(null)

  const filteredEmployees = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return employees
    return employees.filter((e) => e.name.toLowerCase().includes(needle))
  }, [employees, search])

  function openAdd() {
    setEditingEmployee(null)
    setDialogOpen(true)
  }

  function openEdit(employee) {
    setEditingEmployee(employee)
    setDialogOpen(true)
  }

  function handleSave(saved) {
    setEmployees((list) => {
      const exists = list.some((e) => e.id === saved.id)
      return exists ? list.map((e) => (e.id === saved.id ? saved : e)) : [saved, ...list]
    })
  }

  function confirmDeactivate() {
    setEmployees((list) =>
      list.map((e) => (e.id === deactivatingEmployee.id ? { ...e, isActive: false } : e))
    )
    setDeactivatingEmployee(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Master Karyawan
      </Typography>

      <Paper className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <TextField
            size="small"
            label="Cari karyawan"
            placeholder="Cari nama karyawan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 320 }}
          />
          <Button variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={openAdd}>
            Tambah Karyawan
          </Button>
        </div>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nama</TableCell>
                <TableCell>Jabatan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>{e.name}</TableCell>
                  <TableCell>{e.position}</TableCell>
                  <TableCell>
                    <Chip
                      label={e.isActive ? 'Aktif' : 'Nonaktif'}
                      color={e.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label={`Edit ${e.name}`} onClick={() => openEdit(e)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {e.isActive && (
                      <IconButton
                        size="small"
                        aria-label={`Nonaktifkan ${e.name}`}
                        onClick={() => setDeactivatingEmployee(e)}
                      >
                        <PersonOffIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Tidak ada karyawan yang cocok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <EmployeeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        employee={editingEmployee}
      />

      <Dialog open={!!deactivatingEmployee} onClose={() => setDeactivatingEmployee(null)}>
        <DialogTitle>Nonaktifkan Karyawan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Yakin ingin menonaktifkan {deactivatingEmployee?.name}? Karyawan nonaktif tidak akan muncul
            sebagai pilihan "Dilayani oleh" saat input transaksi baru.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivatingEmployee(null)}>Batal</Button>
          <Button color="error" variant="contained" onClick={confirmDeactivate}>
            Nonaktifkan
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
