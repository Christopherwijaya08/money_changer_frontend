import { useState } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Chip from '@mui/material/Chip'
import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import { branches as initialBranches } from '../mocks/data'
import BranchFormDialog from '../components/BranchFormDialog'

export default function MasterCabangPage() {
  const [branches, setBranches] = useState(initialBranches)
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleAdd(newBranch) {
    setBranches((list) => [newBranch, ...list])
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Typography variant="h5" component="h1" className="font-medium">
          Daftar Cabang
        </Typography>
        <Button variant="contained" startIcon={<AddBusinessIcon />} onClick={() => setDialogOpen(true)}>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.name}</TableCell>
                  <TableCell>{b.address}</TableCell>
                  <TableCell>
                    <Chip
                      label={b.isActive ? 'Aktif' : 'Nonaktif'}
                      color={b.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <BranchFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleAdd} />
    </div>
  )
}
