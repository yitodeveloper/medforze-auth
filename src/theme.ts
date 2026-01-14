import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007BFF', // Azul Medforze Brillante
    },
    background: {
      default: '#0A1929', // Azul Marino Profundo
      paper: '#132F4C', // Superficies (Cards)
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B2BAC2', // Gris Azulado
    },
    error: {
      main: '#F44336', // Rojo Vibrante
    },
    divider: '#1E4976',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#FFFFFF',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#FFFFFF',
    },
    body1: {
      fontSize: '1rem',
      color: '#FFFFFF',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#B2BAC2',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            '& fieldset': {
              borderColor: '#1E4976',
            },
            '&:hover fieldset': {
              borderColor: '#007BFF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#007BFF',
              boxShadow: '0 0 8px rgba(0, 123, 255, 0.4)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#132F4C',
          borderRadius: 16,
          border: '1px solid #1E4976',
          boxShadow: 'none',
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: '#B2BAC2', // Gris Azulado para pasos pendientes
          '&.Mui-active': {
            color: '#007BFF', // Azul Primario para el activo
          },
          '&.Mui-completed': {
            color: '#007BFF', // Azul Primario para completados
          },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          color: '#B2BAC2',
          '&.Mui-active': {
            color: '#FFFFFF',
            fontWeight: 600,
          },
          '&.Mui-completed': {
            color: '#B2BAC2',
          },
        },
      },
    },
    MuiStepConnector: {
      styleOverrides: {
        line: {
          borderColor: '#1E4976',
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          h4: 'h4',
          h5: 'h5',
          h6: 'h6',
          subtitle1: 'p',
          subtitle2: 'p',
          body1: 'p',
          body2: 'p',
        },
      },
    },
  },
});

export default theme;
