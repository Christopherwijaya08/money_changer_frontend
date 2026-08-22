import { useState } from 'react'
import { Navigate } from 'react-router-dom'
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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import { adminUsers as initialAdminUsers } from '../mocks/data'
import { useAuth } from '../context/AuthContext'
import AccountFormDialog from '../components/AccountFormDialog'
import StatusChip from '../components/StatusChip'

export default function AccessPage() {
  const { role } = useAuth()
  const [accounts, setAccounts] = useState(initialAdminUsers)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [deactivatingAccount, setDeactivatingAccount] = useState(null)

  if (role !== 'owner') {
    return <Navigate to="/" replace />
  }

  function openAdd() {
    setEditingAccount(null)
    setDialogOpen(true)
  }

  function openEdit(account) {
    setEditingAccount(account)
    setDialogOpen(true)
  }

  function handleSave(saved) {
    setAccounts((list) => {
      const exists = list.some((a) => a.id === saved.id)
      return exists ? list.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...list]
    })
  }

  function confirmDeactivate() {
    setAccounts((list) =>
      list.map((a) => (a.id === deactivatingAccount.id ? { ...a, isActive: false } : a))
    )
    setDeactivatingAccount(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Typography variant="h5" component="h1" className="font-medium">
          Kelola Akses
        </Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={openAdd}>
          Tambah Akun
        </Button>
      </div>

      <Paper className="p-6">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nama</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Peran</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={a.role === 'owner' ? 'Owner' : 'Admin'}
                      size="small"
                      color={a.role === 'owner' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusChip active={a.isActive} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label={`Edit ${a.name}`} onClick={() => openEdit(a)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {a.isActive && (
                      <IconButton
                        size="small"
                        aria-label={`Nonaktifkan ${a.name}`}
                        onClick={() => setDeactivatingAccount(a)}
                      >
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <AccountFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        account={editingAccount}
      />

      <Dialog open={!!deactivatingAccount} onClose={() => setDeactivatingAccount(null)}>
        <DialogTitle>Nonaktifkan Akun</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Yakin ingin menonaktifkan akun {deactivatingAccount?.name}? Akun ini tidak akan bisa login
            lagi sampai diaktifkan kembali.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivatingAccount(null)}>Batal</Button>
          <Button color="error" variant="contained" onClick={confirmDeactivate}>
            Nonaktifkan
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
