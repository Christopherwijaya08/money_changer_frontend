import { createTheme } from '@mui/material/styles'

// Tokens sourced from design.md (Public Sans / neutral text-surface palette).
const fontStack =
  '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'

// space.1..space.8 from design.md
const spacingScale = { 1: 4, 2: 5, 3: 6, 4: 8, 5: 9, 6: 12, 7: 16, 8: 24 }

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1C252E', // color.text.primary — flat neutral accent (clean/functional style)
      dark: '#141B22',
      light: '#454F5B',
      contrastText: '#FFFFFF', // color.text.inverse
    },
    text: {
      primary: '#1C252E',
      secondary: '#637381',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    divider: 'rgba(145, 158, 171, 0.2)', // color.surface.muted (#919EAB) at low opacity
    grey: {
      500: '#919EAB', // color.surface.muted
    },
    common: {
      black: '#000000', // color.surface.base
      white: '#FFFFFF', // color.text.inverse
    },
  },
  shape: {
    borderRadius: 8, // radius.xs
  },
  spacing: (factor) => `${spacingScale[factor] ?? factor * 4}px`,
  transitions: {
    duration: {
      shortest: 120, // motion.duration.instant
      shorter: 150, // motion.duration.fast
      short: 250, // motion.duration.normal
      standard: 300, // motion.duration.slow
    },
  },
  typography: {
    fontFamily: fontStack,
    fontSize: 14,
    body2: { fontSize: '0.8125rem' }, // 13px
    caption: { fontSize: '0.8333rem' }, // 13.33px
    body1: { fontSize: '0.875rem' }, // 14px
    subtitle2: { fontSize: '0.9375rem', fontWeight: 600 }, // 15px
    subtitle1: { fontSize: '1rem', fontWeight: 600 }, // 16px
    h6: { fontSize: '1.125rem', fontWeight: 600 }, // 18px
    h5: { fontSize: '1.5rem', fontWeight: 600 }, // 24px
    button: { fontSize: '0.9375rem', textTransform: 'none', fontWeight: 600 }, // 15px
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(145, 158, 171, 0.2)',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderBottom: '1px solid rgba(255,255,255,0.12)' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: '1px solid rgba(145, 158, 171, 0.2)' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#637381',
          backgroundColor: '#F9FAFB',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
})

export default theme
