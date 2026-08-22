import { useState } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditIcon from '@mui/icons-material/Edit'
import { currencies as initialCurrencies } from '../mocks/data'
import CurrencyFormDialog from '../components/CurrencyFormDialog'
import StatusChip from '../components/StatusChip'

export default function CurrencyPage() {
  const [currencies, setCurrencies] = useState(initialCurrencies)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState(null)

  function openAdd() {
    setEditingCurrency(null)
    setDialogOpen(true)
  }

  function openEdit(currency) {
    setEditingCurrency(currency)
    setDialogOpen(true)
  }

  function handleSave(saved) {
    setCurrencies((list) => {
      const exists = list.some((c) => c.id === saved.id)
      return exists ? list.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...list]
    })
  }

  function handleToggleActive(currency) {
    setCurrencies((list) =>
      list.map((c) => (c.id === currency.id ? { ...c, isActive: !c.isActive } : c))
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Typography variant="h5" component="h1" className="font-medium">
          Master Mata Uang
        </Typography>
        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={openAdd}>
          Tambah Mata Uang
        </Button>
      </div>

      <Paper className="p-6">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Kode</TableCell>
                <TableCell>Nama Mata Uang</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currencies.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.code}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <StatusChip active={c.isActive} />
                  </TableCell>
                  <TableCell align="right">
                    <Switch
                      size="small"
                      checked={c.isActive}
                      onChange={() => handleToggleActive(c)}
                      aria-label={`Ubah status ${c.name}`}
                    />
                    <IconButton size="small" aria-label={`Edit ${c.name}`} onClick={() => openEdit(c)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <CurrencyFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        currency={editingCurrency}
      />
    </div>
  )
}
