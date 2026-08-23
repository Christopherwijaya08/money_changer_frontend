import { useEffect, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import LockIcon from '@mui/icons-material/Lock'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../api/apiClient'

// ponytail: KTP photo is KYC-sensitive, so only Owner can view it — Admin sees a locked
// placeholder. The endpoint requires a Bearer token now, so a plain <img src> can't load
// it directly — fetched as a blob and turned into an object URL instead.
export default function KtpPhotoAvatar({ customerId, hasPhoto, sx }) {
  const { role } = useAuth()
  const [objectUrl, setObjectUrl] = useState(null)

  useEffect(() => {
    if (role !== 'owner' || !hasPhoto) return
    let cancelled = false
    let currentUrl = null

    async function load() {
      try {
        const blob = await apiClient.download(`/customers/${customerId}/ktp-photo`)
        if (cancelled) return
        currentUrl = URL.createObjectURL(blob)
        setObjectUrl(currentUrl)
      } catch {
        // falls back to the placeholder below
      }
    }

    load()
    return () => {
      cancelled = true
      if (currentUrl) URL.revokeObjectURL(currentUrl)
    }
  }, [role, hasPhoto, customerId])

  if (role === 'owner') {
    return (
      <Avatar variant="rounded" src={objectUrl} sx={sx}>
        KTP
      </Avatar>
    )
  }

  return (
    <Tooltip title="Hanya Owner yang dapat melihat foto KTP">
      <Avatar variant="rounded" sx={{ ...sx, bgcolor: 'action.disabledBackground' }}>
        <LockIcon color="disabled" fontSize="small" />
      </Avatar>
    </Tooltip>
  )
}
