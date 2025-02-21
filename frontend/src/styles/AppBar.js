// sidebar-styles.js
export const AppBarStyles = {
  MuiAppBar: {
    styleOverrides: {
      root: {
        width: '224px',
        height: '100vh',
        left: 0,
        top: 0,
        position: 'fixed',
        background: 'linear-gradient(180deg, #ECECEC 0%, #FFFFFF 100%)',
        boxShadow: '1px 0px 3px rgba(0, 0, 0, 0.1)',
        color: '#000000',
        "& *": { zIndex: 2 },
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
          zIndex: 1,
        },
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        fontFamily: "'Geist Mono', 'SF Mono', Menlo, monospace",
        color: '#000000',
        textTransform: 'lowercase',
        padding: '12px 16px',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        }
      }
    }
  },
  MuiListItemText: {
    styleOverrides: {
      primary: {
        fontSize: '16px',
        fontFamily: "'Geist Mono', 'SF Mono', Menlo, monospace",
        textTransform: 'lowercase',
        letterSpacing: "0.2em" 
      }
    }
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        margin: '0 16px'
      }
    }
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        background: 'linear-gradient(180deg, #ECECEC 0%, #FFFFFF 100%)',
        color: '#000000',
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
          zIndex: 1,
        }
      }
    }
  }
};