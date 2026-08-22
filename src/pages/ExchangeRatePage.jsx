import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import EditIcon from '@mui/icons-material/Edit'
import MenuItem from '@mui/material/MenuItem'
import { currencies as initialCurrencies, exchangeRateHistory as initialHistory } from '../mocks/data'
import { useThousandSeparator } from '../hooks/useThousandSeparator'

const CURRENT_USER = 'Admin'

const rateSchema = yup.object({
  rateBuy: yup
    .number()
    .typeError('Kurs beli harus lebih dari 0')
    .positive('Kurs beli harus lebih dari 0')
    .required('Kurs beli harus lebih dari 0'),
  rateSell: yup
    .number()
    .typeError('Kurs jual harus lebih dari 0')
    .positive('Kurs jual harus lebih dari 0')
    .required('Kurs jual harus lebih dari 0')
    .test('gt-buy', 'Kurs jual harus lebih besar dari kurs beli', function (value) {
      return value > this.parent.rateBuy
    }),
})

export default function ExchangeRatePage() {
  const [currencies, setCurrencies] = useState(initialCurrencies)
  const [history, setHistory] = useState(initialHistory)
  const [editing, setEditing] = useState(null)
  const [filterCurrency, setFilterCurrency] = useState('')

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { rateBuy: '', rateSell: '' }, resolver: yupResolver(rateSchema) })

  const rateBuy = watch('rateBuy')
  const rateSell = watch('rateSell')

  const filteredHistory = filterCurrency
    ? history.filter((h) => h.currencyCode === filterCurrency)
    : history

  function openEdit(currency) {
    setEditing(currency)
    reset({ rateBuy: currency.rateBuy, rateSell: currency.rateSell })
  }

  function closeEdit() {
    setEditing(null)
  }

  function onSubmit(data) {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const newBuy = Number(data.rateBuy)
    const newSell = Number(data.rateSell)

    setCurrencies((list) =>
      list.map((c) =>
        c.id === editing.id ? { ...c, rateBuy: newBuy, rateSell: newSell, updatedAt: now, updatedBy: CURRENT_USER } : c
      )
    )

    setHistory((list) => [
      {
        id: Date.now(),
        currencyCode: editing.code,
        oldBuy: editing.rateBuy,
        oldSell: editing.rateSell,
        newBuy,
        newSell,
        changedBy: CURRENT_USER,
        changedAt: now,
      },
      ...list,
    ])

    closeEdit()
  }

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Master Kurs
      </Typography>

      <Paper className="p-6">
        <Typography variant="h6" className="mb-4">
          Kurs Harian
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mata Uang</TableCell>
                <TableCell align="right">Kurs Beli</TableCell>
                <TableCell align="right">Kurs Jual</TableCell>
                <TableCell>Terakhir Diubah</TableCell>
                <TableCell>Diubah oleh</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currencies.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.code}</TableCell>
                  <TableCell align="right">{c.rateBuy.toLocaleString('id-ID')}</TableCell>
                  <TableCell align="right">{c.rateSell.toLocaleString('id-ID')}</TableCell>
                  <TableCell>{c.updatedAt}</TableCell>
                  <TableCell>{c.updatedBy}</TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(c)}>
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h6">Riwayat Perubahan Kurs</Typography>
          <TextField
            select
            size="small"
            label="Mata Uang"
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Semua</MenuItem>
            {currencies.map((c) => (
              <MenuItem key={c.id} value={c.code}>
                {c.code}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tanggal</TableCell>
                <TableCell>Mata Uang</TableCell>
                <TableCell align="right">Kurs Lama (Beli/Jual)</TableCell>
                <TableCell align="right">Kurs Baru (Beli/Jual)</TableCell>
                <TableCell>Diubah oleh</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((h) => (
                <TableRow key={h.id} hover>
                  <TableCell>{h.changedAt}</TableCell>
                  <TableCell>{h.currencyCode}</TableCell>
                  <TableCell align="right">
                    {h.oldBuy.toLocaleString('id-ID')} / {h.oldSell.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell align="right">
                    {h.newBuy.toLocaleString('id-ID')} / {h.newSell.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>{h.changedBy}</TableCell>
                </TableRow>
              ))}
              {filteredHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {filterCurrency ? 'Tidak ada riwayat untuk mata uang ini.' : 'Belum ada perubahan kurs.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!editing} onClose={closeEdit} maxWidth="xs" fullWidth>
        <DialogTitle>Update Kurs {editing?.code}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2} className="mt-1">
              <Grid size={6}>
                <Controller
                  name="rateBuy"
                  control={control}
                  render={({ field }) => {
                    const [display, handleChange] = useThousandSeparator(field.value, field.onChange)
                    return (
                      <TextField
                        fullWidth
                        inputMode="numeric"
                        label="Kurs Beli"
                        error={!!errors.rateBuy}
                        helperText={errors.rateBuy?.message}
                        value={display}
                        onChange={handleChange}
                      />
                    )
                  }}
                />
              </Grid>
              <Grid size={6}>
                <Controller
                  name="rateSell"
                  control={control}
                  render={({ field }) => {
                    const [display, handleChange] = useThousandSeparator(field.value, field.onChange)
                    return (
                      <TextField
                        fullWidth
                        inputMode="numeric"
                        label="Kurs Jual"
                        error={!!errors.rateSell}
                        helperText={errors.rateSell?.message}
                        value={display}
                        onChange={handleChange}
                      />
                    )
                  }}
                />
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Margin: {Number(rateSell) > 0 && Number(rateBuy) > 0
                    ? (Number(rateSell) - Number(rateBuy)).toLocaleString('id-ID')
                    : '-'}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEdit}>Batal</Button>
            <Button type="submit" variant="contained">
              Simpan
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}
