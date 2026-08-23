import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'

export default function BranchSelector({ value, onChange, options }) {
  return (
    <TextField select size="small" label="Cabang" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((b) => (
        <MenuItem key={b.id} value={b.id}>
          {b.name}
        </MenuItem>
      ))}
    </TextField>
  )
}
