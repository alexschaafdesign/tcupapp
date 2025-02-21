import { fontWeight, textTransform } from '@mui/system';
import palette from './colors/palette'; // Import your palette

export const buttonStyles = {
  MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Round the corners of the buttons
          padding: '8px 16px', // Add padding
          textTransform: 'none', // Remove text transformation
        },
        contained: {
          backgroundColor: palette.secondary.main, // Contained buttons use primary color
          color: palette.neutral.white,
          textTransform: "uppercase",
          '&:hover': {
            backgroundColor: palette.secondary.dark,
          },
        },
        outlined: {
          borderColor: palette.primary.main,
          '&:hover': {
            borderColor: palette.primary.light,
            backgroundColor: palette.primary.main,
            color: palette.neutral.white
          },
        },
        text: {
            borderColor: palette.primary.light,
            '&:hover': {
                backgroundColor: palette.neutral.light, // Light hover effect for text button
              },
            padding: '4px 4px',
          },
        submit: {
          backgroundColor: palette.primary.main,
          color: palette.text.primary,
          '&:hover': {
            backgroundColor: palette.primary.light,
          },
          padding: '12px 80px',
          textTransform: 'uppercase', // Prevent uppercase transformation
          fontFamily: '"Roboto", "Arial", sans-serif', // Set font family
          fontWeight: 600, // Set font weight
          fontSize: '1rem', // Set font size
        },
          danger: {
            backgroundColor: palette.error.main, // Contained buttons use primary color
            color: palette.neutral.white,
            fontWeight: "bold",
            textTransform: "uppercase",
            '&:hover': {
              backgroundColor: palette.error.light,
            },
          },
      },
    },
  MuiIconButton: {
    styleOverrides: {
      root: {
        color: palette.warning.main,
      },
    },
  },
};