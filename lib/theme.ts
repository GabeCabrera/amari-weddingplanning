
"use client";

import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { amber, grey, deepOrange } from '@mui/material/colors';

// A custom theme for this app
let theme = createTheme({
  palette: {
    primary: {
      main: '#D4A69C', // A warm, rosy-brown, inspired by the original design
    },
    secondary: {
      main: '#B0A09A', // A complementary, softer brown
    },
    error: {
      main: deepOrange.A400,
    },
    background: {
      default: '#FDFBFA', // A very light, warm off-white, similar to Airbnb
      paper: '#FFFFFF',
    },
    text: {
      primary: '#4A4540', // Dark, warm grey for text
      secondary: '#78716C', // Lighter grey for secondary text
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 300,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 300,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
    },
    button: {
      textTransform: 'none', // For a less "shouty" Google-like feel
    },
  },
  shape: {
    borderRadius: 12, // Softer, more modern rounded corners
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#4A4540',
          borderBottom: '1px solid #E7E5E4',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
