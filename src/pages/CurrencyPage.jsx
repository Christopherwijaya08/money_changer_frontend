import { useEffect, useState } from 'react'
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
import Alert from '@mui/material/Alert'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditIcon from '@mui/icons-material/Edit'
import { apiClient } from '../api/apiClient'
import { mapCurrency } from '../api/mappers'
import CurrencyFormDialog from '../components/CurrencyFormDialog'
import StatusChip from '../components/StatusChip'

export default function CurrencyPage() {
  const [currencies, setCurrencies] = useState([])
  const [pageError, setPageError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState(null)

  async function loadCurrencies() {
    try {
      const res = await apiClient.get('/currencies')
      setCurrencies(res.data.map(mapCurrency))
    } catch (err) {
      setPageError(err.message ?? 'Gagal memuat data mata uang')
    }
  }

  useEffect(() => {
    loadCurrencies()
  }, [])

  function openAdd() {
    setEditingCurrency(null)
    setDialogOpen(true)
  }

  function openEdit(currency) {
    setEditingCurrency(currency)
    setDialogOpen(true)
  }

  async function handleSave(formData) {
    const isEditing = !!editingCurrency

    try {
      setPageError('')
      const response = isEditing
        ? await apiClient.put(`/currencies/${editingCurrency.id}`, { code: formData.code, name: formData.name })
        : await apiClient.post('/currencies', { code: formData.code, name: formData.name })
      const saved = mapCurrency(response.data)
      setCurrencies((list) => (isEditing ? list.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...list]))
    } catch (err) {
      setPageError(err.message ?? 'Gagal menyimpan mata uang')
    }
  }

  async function handleToggleActive(currency) {
    try {
      setPageError('')
      const response = await apiClient.put(`/currencies/${currency.id}`, {
        code: currency.code,
        name: currency.name,
        is_active: !currency.isActive,
      })
      const saved = mapCurrency(response.data)
      setCurrencies((list) => list.map((c) => (c.id === saved.id ? saved : c)))
    } catch (err) {
      setPageError(err.message ?? 'Gagal mengubah status mata uang')
    }
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
