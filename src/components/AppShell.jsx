import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useLocation, useNavigate } from 'react-router-dom'

const DRAWER_WIDTH = 250

const menuGroups = [
  {
    title: 'Operasional',
    items: [{ label: 'Transaksi', path: '/', active: true }],
  },
  {
    title: 'Master Data',
    items: [
      { label: 'Master Kurs', path: '/master-kurs', active: true },
      { label: 'Nasabah', path: '/nasabah', active: true },
      { label: 'Karyawan', path: '/karyawan', active: true },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { label: 'Kas', path: '/kas', active: false },
      { label: 'Laporan', path: '/laporan', active: false },
    ],
  },
  {
    title: 'Ringkasan',
    items: [{ label: 'Dashboard', path: '/dashboard', active: false }],
  },
]

export default function AppShell({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(menuGroups.map((g) => [g.title, true]))
  )

  function toggleGroup(title) {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }))
  }

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
        <List component="nav">
          {menuGroups.map((group, index) => (
            <div key={group.title}>
              {index > 0 && <Divider />}
              <ListItemButton onClick={() => toggleGroup(group.title)}>
                <ListItemText
                  primary={group.title}
                  slotProps={{ primary: { sx: { fontSize: '1rem', fontWeight: 700 } } }}
                />
                {openGroups[group.title] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
              <Collapse in={openGroups[group.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {group.items.map((item) => (
                    <ListItemButton
                      key={item.label}
                      sx={{ pl: 4 }}
                      selected={location.pathname === item.path}
                      disabled={!item.active}
                      onClick={() => navigate(item.path)}
                    >
                      <ListItemText
                        primary={item.label}
                        slotProps={{ primary: { sx: { fontSize: '0.875rem' } } }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </div>
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
