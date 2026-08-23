import { useState } from 'react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CloseIcon from '@mui/icons-material/Close'

const MAX_SIZE_BYTES = 4 * 1024 * 1024

export default function IdPhotoUpload({ value, onChange, onFileChange, label = 'Upload Foto KTP' }) {
  const [error, setError] = useState('')

  function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Ukuran file maksimal 4MB')
      return
    }

    setError('')
    onChange(URL.createObjectURL(file))
    onFileChange?.(file)
  }

  function handleClear() {
    setError('')
    onChange(null)
    onFileChange?.(null)
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <Avatar variant="rounded" src={value} sx={{ width: 64, height: 48 }}>
          KTP
        </Avatar>
        <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
          {label}
          <input type="file" accept="image/*" hidden onChange={handleFile} />
        </Button>
        {value && (
          <IconButton size="small" aria-label="Hapus foto KTP" onClick={handleClear}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </div>
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
    </div>
  )
}
