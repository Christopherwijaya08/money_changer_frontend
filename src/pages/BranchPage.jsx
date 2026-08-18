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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import { branches as initialBranches } from '../mocks/data'
import BranchFormDialog from '../components/BranchFormDialog'
import StatusChip from '../components/StatusChip'

export default function BranchPage() {
  const [branches, setBranches] = useState(initialBranches)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [deactivatingBranch, setDeactivatingBranch] = useState(null)

  function openAdd() {
    setEditingBranch(null)
    setDialogOpen(true)
  }

  function openEdit(branch) {
    setEditingBranch(branch)
    setDialogOpen(true)
  }

  function handleSave(saved) {
    setBranches((list) => {
      const exists = list.some((b) => b.id === saved.id)
      return exists ? list.map((b) => (b.id === saved.id ? saved : b)) : [saved, ...list]
    })
  }

  function confirmDeactivate() {
    setBranches((list) =>
      list.map((b) => (b.id === deactivatingBranch.id ? { ...b, isActive: false } : b))
    )
    setDeactivatingBranch(null)
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
