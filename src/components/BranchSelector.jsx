import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { branches } from '../mocks/data'

const activeBranches = branches.filter((b) => b.isActive)

export default function BranchSelector({ value, onChange }) {
  return (
    <TextField select size="small" label="Cabang" value={value} onChange={(e) => onChange(e.target.value)}>
      {activeBranches.map((b) => (
        <MenuItem key={b.id} value={b.id}>
          {b.name}
        </MenuItem>
      ))}
    </TextField>
  )
}
