import palette from './colors/palette'; // Assuming you already have a color palette


export const AppBarStyles = {
    MuiAppBar: {
      styleOverrides: {
        root: {
          width: '224px', // Adjust as needed
          height: '100vh',
          left: 0,
          top: 0,
          position: 'fixed',
          background: 'linear-gradient(180deg, #ECECEC 0%, #FFFFFF 100%)',
          boxShadow: 'none',
          zIndex: 100,
          overflow: 'hidden',
          "&::before": {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("https://res.cloudinary.com/dsll3ms2c/image/upload/v1740072216/noisebg_for_header_xyr0ou.png")',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.15,
            pointerEvents: 'none',
            zIndex: 0,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            fontFamily: 'Courier New, monospace',
            color: '#000000',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }
        },
        MuiListItemText: {
            styleOverrides: {
              primary: {
                fontSize: '14px',
                fontFamily: 'Courier New, monospace',
                textTransform: 'lowercase'
              }
            }
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                backgroundColor: '#E0E0E0'
              }
            }
          }  
      },
    },
  };