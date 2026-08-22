import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import LockIcon from '@mui/icons-material/Lock'
import { useAuth } from '../context/AuthContext'

// ponytail: KTP photo is KYC-sensitive, so only Owner can view it — Admin sees a locked placeholder
export default function KtpPhotoAvatar({ src, sx }) {
  const { role } = useAuth()

  if (role === 'owner') {
    return (
      <Avatar variant="rounded" src={src} sx={sx}>
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
