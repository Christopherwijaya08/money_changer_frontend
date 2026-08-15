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
import Avatar from '@mui/material/Avatar'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import EditIcon from '@mui/icons-material/Edit'
import { customers as initialCustomers } from '../mocks/data'
import CustomerQuickAddDialog from '../components/CustomerQuickAddDialog'

export default function MasterNasabahPage() {
  const [customerList, setCustomerList] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)

  const filteredCustomers = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return customerList
    return customerList.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.identityNumber.toLowerCase().includes(needle) ||
        c.phone.toLowerCase().includes(needle)
    )
  }, [customerList, search])

  function openAdd() {
    setEditingCustomer(null)
    setDialogOpen(true)
  }

  function openEdit(customer) {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }

  function handleSave(saved) {
    setCustomerList((list) => {
      const exists = list.some((c) => c.id === saved.id)
      return exists ? list.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...list]
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Master Nasabah
      </Typography>

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
              {filteredCustomers.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Avatar variant="rounded" src={c.ktpPhotoUrl} sx={{ width: 48, height: 36 }}>
                      KTP
                    </Avatar>
                  </TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.identityNumber}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.address ?? '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label={`Edit ${c.name}`} onClick={() => openEdit(c)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCustomers.length === 0 && (
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
    </div>
  )
}
