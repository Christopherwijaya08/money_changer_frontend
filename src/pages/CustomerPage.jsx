import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import Alert from '@mui/material/Alert'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SettingsIcon from '@mui/icons-material/Settings'
import { api } from '../api/client'
import { mapCustomer } from '../api/mappers'
import CustomerQuickAddDialog from '../components/CustomerQuickAddDialog'
import CustomerDetailDialog from '../components/CustomerDetailDialog'
import KtpPhotoAvatar from '../components/KtpPhotoAvatar'

export default function CustomerPage() {
  const [customerList, setCustomerList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [detailCustomer, setDetailCustomer] = useState(null)

  async function loadCustomers(search) {
    try {
      const res = await api.get('/customers', { search })
      setCustomerList(res.data.map(mapCustomer))
    } catch (err) {
      setPageError(err.message ?? 'Gagal memuat data nasabah')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => loadCustomers(search), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function openAdd() {
    setEditingCustomer(null)
    setDialogOpen(true)
  }

  function openEdit(customer) {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }

  async function handleSave(formData) {
    const isEditing = !!editingCustomer
    const fields = {
      name: formData.name,
      identity_number: formData.identityNumber,
      phone: formData.phone,
      address: formData.address || '',
    }

    try {
      setPageError('')
      let response
      if (formData.idPhotoFile) {
        const body = new FormData()
        Object.entries(fields).forEach(([key, value]) => body.append(key, value))
        body.append('ktp_photo', formData.idPhotoFile)
        if (isEditing) {
          body.append('_method', 'PUT')
          response = await api.post(`/customers/${editingCustomer.id}`, body)
        } else {
          response = await api.post('/customers', body)
        }
      } else if (isEditing) {
        response = await api.put(`/customers/${editingCustomer.id}`, fields)
      } else {
        response = await api.post('/customers', fields)
      }

      const saved = mapCustomer(response.data)
      setCustomerList((list) => (isEditing ? list.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...list]))
    } catch (err) {
      setPageError(err.message ?? 'Gagal menyimpan nasabah')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Typography variant="h5" component="h1" className="font-medium">
          Master Nasabah
        </Typography>
        <Button component={Link} to="/customers/threshold" startIcon={<SettingsIcon />} size="small">
          Pengaturan Threshold
        </Button>
      </div>

      {pageError && (
        <Alert severity="error" onClose={() => setPageError('')}>
          {pageError}
        </Alert>
      )}

      <Paper className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <TextField
            size="small"
            label="Cari nasabah"
            placeholder="Cari nama, no. identitas, atau no. HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 320 }}
          />
          <Button variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={openAdd}>
            Tambah Nasabah
          </Button>
        </div>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Foto KTP</TableCell>
                <TableCell>Nama</TableCell>
                <TableCell>No. Identitas</TableCell>
                <TableCell>No. HP</TableCell>
                <TableCell>Alamat</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customerList.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <KtpPhotoAvatar src={c.idPhotoUrl} sx={{ width: 48, height: 36 }} />
                  </TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.identityNumber}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.address ?? '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label={`Detail ${c.name}`} onClick={() => setDetailCustomer(c)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label={`Edit ${c.name}`} onClick={() => openEdit(c)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && customerList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Tidak ada nasabah yang cocok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <CustomerQuickAddDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleSave}
        customer={editingCustomer}
      />
      <CustomerDetailDialog
        open={!!detailCustomer}
        onClose={() => setDetailCustomer(null)}
        customer={detailCustomer}
      />
    </div>
  )
}
