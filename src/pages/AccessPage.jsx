import { useEffect, useState } from 'react'
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
import Alert from '@mui/material/Alert'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import { apiClient } from '../api/apiClient'
import { mapAccount } from '../api/mappers'
import { useAuth } from '../context/AuthContext'
import AccountFormDialog from '../components/AccountFormDialog'
import StatusChip from '../components/StatusChip'

export default function AccessPage() {
  const { role } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [pageError, setPageError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [deactivatingAccount, setDeactivatingAccount] = useState(null)

  async function loadAccounts() {
    try {
      const res = await apiClient.get('/admin/users')
      setAccounts(res.data.map(mapAccount))
    } catch (err) {
      setPageError(err.message ?? 'Gagal memuat data akun')
    }
  }

  useEffect(() => {
    if (role === 'owner') loadAccounts()
  }, [role])

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

  async function handleSave(formData) {
    const isEditing = !!editingAccount
    const fields = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      ...(formData.password ? { password: formData.password } : {}),
    }

    try {
      setPageError('')
      const response = isEditing
        ? await apiClient.put(`/admin/users/${editingAccount.id}`, fields)
        : await apiClient.post('/admin/users', fields)
      const saved = mapAccount(response.data)
      setAccounts((list) => (isEditing ? list.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...list]))
    } catch (err) {
      setPageError(err.message ?? 'Gagal menyimpan akun')
    }
  }

  async function confirmDeactivate() {
    try {
      setPageError('')
      const response = await apiClient.put(`/admin/users/${deactivatingAccount.id}`, {
        name: deactivatingAccount.name,
        email: deactivatingAccount.email,
        role: deactivatingAccount.role,
        is_active: false,
      })
      const saved = mapAccount(response.data)
      setAccounts((list) => list.map((a) => (a.id === saved.id ? saved : a)))
    } catch (err) {
      setPageError(err.message ?? 'Gagal menonaktifkan akun')
    } finally {
      setDeactivatingAccount(null)
    }
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

      {pageError && (
        <Alert severity="error" onClose={() => setPageError('')}>
          {pageError}
        </Alert>
      )}

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
