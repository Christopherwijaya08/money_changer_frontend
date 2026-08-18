import Chip from '@mui/material/Chip'

export default function StatusChip({ active }) {
  return (
    <Chip
      label={active ? 'Aktif' : 'Nonaktif'}
      color={active ? 'success' : 'default'}
      size="small"
    />
  )
}
