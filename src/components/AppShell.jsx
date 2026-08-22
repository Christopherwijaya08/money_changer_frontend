import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { alpha } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import MenuIcon from '@mui/icons-material/Menu'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import BadgeIcon from '@mui/icons-material/Badge'
import StorefrontIcon from '@mui/icons-material/Storefront'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { useLocation, useNavigate } from 'react-router-dom'
import BranchSelector from './BranchSelector'
import { useBranch } from '../context/BranchContext'
import { useAuth } from '../context/AuthContext'

const DRAWER_WIDTH = 250
const DRAWER_WIDTH_COLLAPSED = 72

const menuGroups = [
  {
    title: 'Operasional',
    items: [{ label: 'Transaksi', path: '/', active: true, icon: SwapHorizIcon }],
  },
  {
    title: 'Master Data',
    items: [
      { label: 'Mata Uang', path: '/currencies', active: true, icon: CurrencyExchangeIcon },
      { label: 'Master Kurs', path: '/exchange-rates', active: true, icon: TrendingUpIcon },
      { label: 'Nasabah', path: '/customers', active: true, icon: PeopleAltIcon },
      { label: 'Karyawan', path: '/employees', active: true, icon: BadgeIcon },
      { label: 'Cabang', path: '/branches', active: true, icon: StorefrontIcon },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { label: 'Kas', path: '/cash', active: true, icon: AccountBalanceWalletIcon },
      { label: 'Laporan', path: '/reports', active: true, icon: AssessmentIcon },
    ],
  },
  {
    title: 'Ringkasan',
    items: [{ label: 'Dashboard', path: '/dashboard', active: true, icon: SpaceDashboardIcon }],
  },
  {
    title: 'Keamanan',
    items: [
      {
        label: 'Kelola Akses',
        path: '/access',
        active: false,
        icon: AdminPanelSettingsIcon,
        roles: ['owner'],
      },
    ],
  },
]

export default function AppShell({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(menuGroups.map((g) => [g.title, true]))
  )
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { selectedBranchId, setSelectedBranchId } = useBranch()
  const { role } = useAuth()

  const visibleGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0)

  function toggleGroup(title) {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  function handleNavigate(path) {
    navigate(path)
    if (!isDesktop) setMobileOpen(false)
  }

  const isCollapsed = isDesktop && collapsed
  const drawerWidth = isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH
  const isDrawerVisible = isDesktop || mobileOpen

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
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            flexWrap: isDesktop ? 'nowrap' : 'wrap',
            rowGap: 1,
            py: isDesktop ? 0 : 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => (isDesktop ? setCollapsed((c) => !c) : setMobileOpen((o) => !o))}
              edge="start"
              size="small"
            >
              {isDrawerVisible ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" noWrap component="div" color="text.primary">
              Money Changer
            </Typography>
          </Box>
          <Box sx={{ width: isDesktop ? 'auto' : '100%' }}>
            <BranchSelector value={selectedBranchId} onChange={setSelectedBranchId} />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDrawerVisible}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          root: { keepMounted: true },
          paper: {
            sx: {
              width: drawerWidth,
              boxSizing: 'border-box',
              overflowX: 'hidden',
              transition: (theme) => theme.transitions.create('width'),
            },
          },
        }}
        sx={{
          width: isDesktop ? drawerWidth : 0,
          flexShrink: 0,
          transition: (theme) => theme.transitions.create('width'),
        }}
      >
        <Toolbar sx={{ minHeight: isDesktop ? undefined : 128 }} />
        <List component="nav" sx={{ px: 1 }}>
          {visibleGroups.map((group) => (
            <div key={group.title}>
              {!isCollapsed && (
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
              )}
              <Collapse in={isCollapsed || openGroups[group.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {group.items.map((item) => {
                    const isSelected = location.pathname === item.path
                    const button = (
                      <ListItemButton
                        key={item.label}
                        sx={{
                          pl: isCollapsed ? '24px' : '64px',
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          mx: 0.5,
                          my: 0.25,
                          mt: isCollapsed ? 1 : 0.25,
                          borderRadius: 1,
                          '&.Mui-selected': {
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                            '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12) },
                          },
                        }}
                        selected={isSelected}
                        disabled={!item.active}
                        onClick={() => handleNavigate(item.path)}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: isCollapsed ? 0 : 1.5,
                            color: isSelected ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          <item.icon fontSize="small" />
                        </ListItemIcon>
                        {!isCollapsed && (
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
                        )}
                      </ListItemButton>
                    )

                    return isCollapsed ? (
                      <Tooltip key={item.label} title={item.label} placement="right">
                        <span>{button}</span>
                      </Tooltip>
                    ) : (
                      button
                    )
                  })}
                </List>
              </Collapse>
            </div>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 8, minWidth: 0, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Toolbar sx={{ minHeight: isDesktop ? undefined : 128 }} />
        {children}
      </Box>
    </Box>
  )
}
