import { fontSize, fontStyle, fontWeight, textTransform } from '@mui/system';
import palette from './colors/palette'; // Import your palette


export const components = {
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: '24px',
          borderRadius: '8px',
        },
      },
    },
    MuiCheckbox: {
        styleOverrides: {
          root: {
            color: palette.primary.main, // Default unchecked color (use your preferred color)
            '&.Mui-checked': {
              color: palette.primary.main, // Checked color
            },
            '&:hover': {
              backgroundColor: palette.primary.light, // Hover effect
            },
            '&.Mui-disabled': {
              color: 'rgba(0, 0, 0, 0.26)', // Disabled state color
            },
          },
        },
        defaultProps: {
          disableRipple: true, // Disable ripple effect for cleaner UI
        },
      },
      MuiTab: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.neutral.white, // Default text color
            fontSize: "1.25rem",
            textTransform: "uppercase",
            margin: "0 16px",
            fontWeight: "400",
            "&.Mui-selected": {
              color: theme.palette.neutral.white, // Highlighted text color when selected
            },
            "&:hover": {
              color: "#FFFFFF", // Hover effect color
              backgroundColor: theme.palette.primary.light, // Use theme token
            },
          }),
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent", // Background color of the tabs container
          },
          indicator: ({ theme }) => ({
            backgroundColor: theme.palette.neutral.white, // Use theme token for active tab underline
          }),
        },
      },
    MuiSelect: {
        styleOverrides: {
          icon: {
            color: 'rgba(0, 0, 0, 0.54)', // Optional: Customize dropdown
          },
        },
      }, 


      
    MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.secondary.main, // Custom color for AppBar
            padding: '8px 16px',
          },
        },
      },
    MuiDrawer: {
        styleOverrides: {
          root: {
            backgroundColor: '#fff', // Background color for the Drawer
          },
        },
      },  
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px', // Round corners of the Card
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Custom shadow
            padding: '16px', // Add padding inside the Card
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: palette.secondary.main,
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },
            padding: '8px',
            borderRadius: '8px',
            // Add other styles you want globally
          }),
        },
        // Optional default props
        defaultProps: {
          disableRipple: false, // Set to true if you want to disable the ripple effect
        },
      },
      
  };
  