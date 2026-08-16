import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

const filterOptions = createFilterOptions({
  stringify: (c) => `${c.name} ${c.identityNumber} ${c.phone}`,
})

export default function CustomerSearchField({
  options,
  value,
  onChange,
  error,
  helperText,
  label = 'Customer',
  placeholder = 'Cari nama, no. identitas, atau no. HP...',
}) {
  return (
    <Autocomplete
      options={options}
      filterOptions={filterOptions}
      getOptionLabel={(c) => `${c.name} — ${c.identityNumber}`}
      renderOption={(props, c) => (
        <li {...props} key={c.id}>
          <div className="flex flex-col">
            <span>{c.name}</span>
            <span className="text-xs text-gray-500">
              {c.identityNumber} · {c.phone}
            </span>
          </div>
        </li>
      )}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} error={error} helperText={helperText} />
      )}
      noOptionsText="Nasabah tidak ditemukan — klik + Nasabah Baru"
    />
  )
}
