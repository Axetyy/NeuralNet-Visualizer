'use client';
import { createTheme } from '@mui/material/styles';

export const pageSpacing = 4;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f2933', // deep neutral blue-gray
    },
    secondary: {
      main: '#4b5563', // muted gray
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
    divider: '#e5e7eb',
    grey: {
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      700: '#374151',
    },
  },

  typography: {
    fontSize: 14,
    h3: {
      fontSize: 32,
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: 24,
      fontWeight: 500,
    },
    h5: {
      fontSize: 18,
      fontWeight: 500,
    },
    body1: {
      fontSize: 14,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: 13,
      color: '#6b7280',
    },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          padding: '6px 14px',
        },
        contained: {
          backgroundColor: '#1f2933',
          '&:hover': {
            backgroundColor: '#111827',
          },
        },
        outlined: {
          borderColor: '#d1d5db',
          color: '#111827',
          '&:hover': {
            borderColor: '#9ca3af',
            backgroundColor: '#f3f4f6',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e7eb',
          boxShadow: 'none',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e7eb',
          boxShadow: 'none',
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e5e7eb',
        },
      },
    },

    MuiSlider: {
      styleOverrides: {
        thumb: {
          boxShadow: 'none',
        },
        track: {
          border: 'none',
        },
      },
    },
  },
});

export default theme;
