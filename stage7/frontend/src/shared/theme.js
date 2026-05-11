import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111111',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#555555',
    },
    background: {
      default: '#f7f7f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#111111',
      secondary: '#555555',
      disabled: '#999999',
    },
    divider: '#e0e0e0',
    action: {
      hover: '#f0f0f0',
      selected: '#e8e8e8',
    },
  },
  typography: {
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    h5: { fontWeight: 600, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500, color: '#555555' },
    body2: { color: '#555555' },
    caption: { fontFamily: "'IBM Plex Mono', monospace", color: '#999999', fontSize: '0.7rem' },
  },
  shape: { borderRadius: 2 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          backgroundColor: '#111111',
          '&:hover': { backgroundColor: '#333333' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.68rem',
          height: 22,
          borderRadius: 2,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: 'none', border: '1px solid #e0e0e0' },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#e8e8e8' } },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 44,
          padding: '6px 16px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid #eeeeee', padding: '10px 16px' },
        head: { fontWeight: 600, backgroundColor: '#f7f7f7', color: '#111111' },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: { display: 'flex', justifyContent: 'center' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { backgroundColor: '#ffffff' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: '#e0e0e0' },
      },
    },
  },
})

export default theme
