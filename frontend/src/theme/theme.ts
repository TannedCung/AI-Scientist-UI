import { createTheme } from '@mui/material/styles';

// Get colors from environment variables or use defaults
const getPrimaryColor = () => {
  return process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#b8d8d8';
};

const getSecondaryColor = () => {
  return process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#ffd5c2';
};

const getAccentColor = () => {
  return process.env.NEXT_PUBLIC_ACCENT_COLOR || '#f6c8ea';
};

// Define our three pastel colors
const colors = {
  primary: {
    main: getPrimaryColor(), // Soft teal or from env
    light: '#e5f1f1',
    dark: '#7fb9b9',
    contrastText: '#2c3e50',
  },
  secondary: {
    main: getSecondaryColor(), // Soft peach or from env
    light: '#fff0e8',
    dark: '#ffc09e',
    contrastText: '#2c3e50',
  },
  tertiary: {
    main: getAccentColor(), // Soft lavender or from env
    light: '#faeef8',
    dark: '#e297d3',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
  text: {
    primary: '#2c3e50',
    secondary: '#7f8c8d',
  },
};

// Create theme
const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    text: colors.text,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme; 