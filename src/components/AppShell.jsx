import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import { useLocation, useNavigate } from 'react-router-dom'

const DRAWER_WIDTH = 220

const menuItems = [
  { label: 'Transaksi', path: '/', active: true },
  { label: 'Master Kurs', path: '/master-kurs', active: true },
  { label: 'Nasabah', path: '/nasabah', active: true },
  { label: 'Karyawan', path: '/karyawan', active: false },
  { label: 'Kas', path: '/kas', active: false },
  { label: 'Laporan', path: '/laporan', active: false },
  { label: 'Dashboard', path: '/dashboard', active: false },
]

export default function AppShell({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Money Changer
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.label}
              selected={location.pathname === item.path}
              disabled={!item.active}
              onClick={() => navigate(item.path)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
