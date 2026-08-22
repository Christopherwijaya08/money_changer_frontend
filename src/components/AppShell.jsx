import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
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
      { label: 'Mata Uang', path: '/currencies', active: true },
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
      <AppBar
        position="fixed"
        color="transparent"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          px: 4,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div" color="text.primary">
            Money Changer
          </Typography>
          <BranchSelector value={selectedBranchId} onChange={setSelectedBranchId} />
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
        <List component="nav" sx={{ px: 1 }}>
          {menuGroups.map((group) => (
            <div key={group.title}>
              <ListItemButton
                onClick={() => toggleGroup(group.title)}
                sx={{
                  borderRadius: 1,
                  mt: 1.5,
                  '&:hover .group-chevron': { opacity: 1 },
                }}
              >
                <ExpandMoreIcon
                  fontSize="small"
                  className="group-chevron"
                  sx={{
                    opacity: 0,
                    mr: 0.5,
                    transition: (theme) => theme.transitions.create('all'),
                    transform: openGroups[group.title] ? 'rotate(0deg)' : 'rotate(-90deg)',
                    color: 'text.secondary',
                  }}
                />
                <ListItemText
                  primary={group.title}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      },
                    },
                  }}
                />
              </ListItemButton>
              <Collapse in={openGroups[group.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {group.items.map((item) => {
                    const isSelected = location.pathname === item.path
                    return (
                      <ListItemButton
                        key={item.label}
                        sx={{
                          pl: '32px',
                          mx: 0.5,
                          my: 0.25,
                          borderRadius: 1,
                          '&.Mui-selected': {
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                            '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12) },
                          },
                        }}
                        selected={isSelected}
                        disabled={!item.active}
                        onClick={() => navigate(item.path)}
                      >
                        <ListItemText
                          primary={item.label}
                          slotProps={{
                            primary: {
                              sx: {
                                fontSize: '0.875rem',
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? 'primary.main' : 'text.primary',
                              },
                            },
                          }}
                        />
                      </ListItemButton>
                    )
                  })}
                </List>
              </Collapse>
            </div>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 8, minWidth: 0, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
