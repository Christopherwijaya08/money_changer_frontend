import { useState } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Chip from '@mui/material/Chip'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import EditIcon from '@mui/icons-material/Edit'
import { employees as initialEmployees } from '../mocks/data'
import EmployeeFormDialog from '../components/EmployeeFormDialog'

export default function MasterKaryawanPage() {
  const [employees, setEmployees] = useState(initialEmployees)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Typography variant="h5" component="h1" className="font-medium">
          Master Karyawan
        </Typography>
        <Button variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={openAdd}>
          Tambah Karyawan
        </Button>
      </div>

      <Paper className="p-6">
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
              {employees.map((e) => (
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
                  </TableCell>
                </TableRow>
              ))}
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
    </div>
  )
}
