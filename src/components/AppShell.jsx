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
import BranchSelector from './BranchSelector'
import { useBranch } from '../context/BranchContext'

const DRAWER_WIDTH = 250

const menuGroups = [
  {
    title: 'Operasional',
    items: [{ label: 'Transaksi', path: '/', active: true }],
  },
  {
    title: 'Master Data',
    items: [
      { label: 'Master Kurs', path: '/exchange-rates', active: true },
      { label: 'Nasabah', path: '/customers', active: true },
      { label: 'Karyawan', path: '/employees', active: true },
      { label: 'Cabang', path: '/branches', active: true },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { label: 'Kas', path: '/cash', active: false },
      { label: 'Laporan', path: '/reports', active: false },
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
  const { selectedBranchId, setSelectedBranchId } = useBranch()

  function toggleGroup(title) {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">
            Money Changer
          </Typography>
          <Box sx={{ '& .MuiInputBase-root': { color: 'inherit' }, '& .MuiInputLabel-root': { color: 'inherit' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' } }}>
            <BranchSelector value={selectedBranchId} onChange={setSelectedBranchId} />
          </Box>
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
