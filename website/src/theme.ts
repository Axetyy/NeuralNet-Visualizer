'use client';
import { Palette } from '@mui/icons-material';
import { createTheme } from '@mui/material/styles';
declare module '@mui/material/styles' {
  interface Palette {
    gradients: {
      primary: string;
      secondary: string;
    };
  }
  interface PaletteOptions {
    gradients?: {
      primary?: string;
      secondary?: string;
    };
  }
}
export const pageSpacing = 4;
const colorPalette = {
  primary: {
    main: '#1f2933',
  },
  secondary: {
    main: '#4b5563',
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
  gradients: {
    primary: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
    secondary: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
  },
};
const theme = createTheme({
  palette: {
    ...colorPalette,
    gradients: {
      primary: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
      secondary: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
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
    MuiTypography: {
      defaultProps: {
        color: 'white',
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label': {
            color: '#fff',
          },
          '& label.Mui-focused': {
            color: '#fff',
          },
          '& .MuiInputBase-input': {
            color: '#fff',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.3)',
            },
            '&:hover fieldset': {
              borderColor: '#fff',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#fff',
            },
          },
        },
      },
    },
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
          // fallback for all contained buttons
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
            backgroundColor: 'secondary.main',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: colorPalette.gradients.primary,
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
            },
          },
        },
      ],
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
    MuiContainer: {
      styleOverrides: {
        root: {},
      },
    },
  },
});

export default theme;
