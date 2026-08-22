import { useState } from 'react'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import { cashBalances } from '../mocks/data'
import { useBranch } from '../context/BranchContext'

const TABS = ['Saldo Kas', 'Setor Kas', 'Rekonsiliasi Harian']

function formatBalance(value) {
  return value.toLocaleString('id-ID')
}

function CashBalanceTab() {
  const { selectedBranchId, branches } = useBranch()
  const branchName = branches.find((b) => b.id === selectedBranchId)?.name
  const balances = cashBalances.filter((b) => b.branchId === selectedBranchId)

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body2" color="text.secondary">
        Menampilkan saldo kas untuk cabang: {branchName}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mata Uang</TableCell>
              <TableCell>Nama</TableCell>
              <TableCell align="right">Saldo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.map((b) => (
              <TableRow key={b.currencyCode} hover>
                <TableCell>{b.currencyCode}</TableCell>
                <TableCell>{b.currencyName}</TableCell>
                <TableCell align="right">{formatBalance(b.balance)}</TableCell>
              </TableRow>
            ))}
            {balances.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Belum ada data saldo kas untuk cabang ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default function CashPage() {
  const [tab, setTab] = useState(0)

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Kas
      </Typography>

      <Paper>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          {TABS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Paper>

      <Paper className="p-6">
        {tab === 0 && <CashBalanceTab />}
        {tab !== 0 && (
          <Typography color="text.secondary">{TABS[tab]} akan tersedia di sini.</Typography>
        )}
      </Paper>
    </div>
  )
}
