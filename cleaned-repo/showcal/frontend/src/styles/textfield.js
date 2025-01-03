import palette from './colors/palette'; // Import your palette

export const textFieldStyles = {
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      fullWidth: true,
    },
    styleOverrides: {
      root: {
        marginBottom: '0px',
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        color: '#000000',
        fontSize: '0.875rem',
        fontWeight: 400,
        marginLeft: '4px',
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        color: 'rgba(0, 0, 0, 0.6)',
        backgroundColor: 'transparent',
      },
      shrink: {
        transform: 'translate(14px, -6px) scale(0.75)',
        color: palette.secondary.main,
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: '4px',
      },
      notchedOutline: {
        borderColor: palette.secondary.main,
      },
      input: {
        padding: '16.5px 14px',
      },
    },
  },
  MuiFormLabel: {
    styleOverrides: {
      root: {
        backgroundColor: 'white', // Optional: Add background color to avoid overlap
        padding: '0 4px', // Padding to ensure the text fits inside the notch
        transform: 'translate(14px, -6px) scale(0.75)', // Proper floating label position
      },
    },
  },
};