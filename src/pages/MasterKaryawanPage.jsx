import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Chip from '@mui/material/Chip'
import { employees } from '../mocks/data'

export default function MasterKaryawanPage() {
  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h5" component="h1" className="font-medium">
        Master Karyawan
      </Typography>

      <Paper className="p-6">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nama</TableCell>
                <TableCell>Jabatan</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>{e.name}</TableCell>
                  <TableCell>{e.position}</TableCell>
                  <TableCell>
                    <Chip
                      label={e.isActive ? 'Aktif' : 'Nonaktif'}
                      color={e.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
}
