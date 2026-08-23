import { useEffect, useState } from 'react'
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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import { apiClient } from '../api/apiClient'
import { mapBranch } from '../api/mappers'
import BranchFormDialog from '../components/BranchFormDialog'
import StatusChip from '../components/StatusChip'

export default function BranchPage() {
  const [branches, setBranches] = useState([])
  const [pageError, setPageError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [deactivatingBranch, setDeactivatingBranch] = useState(null)

  async function loadBranches() {
    try {
      const res = await apiClient.get('/branches')
      setBranches(res.data.map(mapBranch))
    } catch (err) {
      setPageError(err.message ?? 'Gagal memuat data cabang')
    }
  }

  useEffect(() => {
    loadBranches()
  }, [])

  function openAdd() {
    setEditingBranch(null)
    setDialogOpen(true)
  }

  function openEdit(branch) {
    setEditingBranch(branch)
    setDialogOpen(true)
  }

  async function handleSave(formData) {
    const isEditing = !!editingBranch
    const fields = { name: formData.name, address: formData.address }

    try {
      setPageError('')
      const response = isEditing
        ? await apiClient.put(`/branches/${editingBranch.id}`, fields)
        : await apiClient.post('/branches', fields)
      const saved = mapBranch(response.data)
      setBranches((list) => (isEditing ? list.map((b) => (b.id === saved.id ? saved : b)) : [saved, ...list]))
    } catch (err) {
      setPageError(err.message ?? 'Gagal menyimpan cabang')
    }
  }

  async function confirmDeactivate() {
    try {
      setPageError('')
      const response = await apiClient.put(`/branches/${deactivatingBranch.id}`, {
        name: deactivatingBranch.name,
        address: deactivatingBranch.address,
        is_active: false,
      })
      const saved = mapBranch(response.data)
      setBranches((list) => list.map((b) => (b.id === saved.id ? saved : b)))
    } catch (err) {
      setPageError(err.message ?? 'Gagal menonaktifkan cabang')
    } finally {
      setDeactivatingBranch(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Typography variant="h5" component="h1" className="font-medium">
          Daftar Cabang
        </Typography>
        <Button variant="contained" startIcon={<AddBusinessIcon />} onClick={openAdd}>
          Tambah Cabang
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
                <TableCell>Nama Cabang</TableCell>
                <TableCell>Alamat</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.name}</TableCell>
                  <TableCell>{b.address}</TableCell>
                  <TableCell>
                    <StatusChip active={b.isActive} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label={`Edit ${b.name}`} onClick={() => openEdit(b)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {b.isActive && (
                      <IconButton
                        size="small"
                        aria-label={`Nonaktifkan ${b.name}`}
                        onClick={() => setDeactivatingBranch(b)}
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

      <BranchFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        branch={editingBranch}
      />

      <Dialog open={!!deactivatingBranch} onClose={() => setDeactivatingBranch(null)}>
        <DialogTitle>Nonaktifkan Cabang</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Yakin ingin menonaktifkan {deactivatingBranch?.name}? Data transaksi, kas, dan karyawan cabang
            ini tidak akan bisa dipilih lagi untuk operasional baru.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivatingBranch(null)}>Batal</Button>
          <Button color="error" variant="contained" onClick={confirmDeactivate}>
            Nonaktifkan
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
