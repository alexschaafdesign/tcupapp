import React from 'react';
import { Box } from '@mui/material';
import Header from '../Header';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Purple bar */}
      <Box 
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: { xs: 0, md: '224px' },
          height: '60px',
          bgcolor: '#7C60DD',
          zIndex: 90,
        }}
      />
      
      {/* Navigation */}
      <Header />
      
      {/* Content wrapper */}
      <Box
        component="main"
        sx={{
          width: '100%',
          minHeight: '100vh',
          marginLeft: { xs: 0, md: 0 },
          paddingTop: '60px',
        }}
      >
        {/* Centered content */}
        <Box
          sx={{
            maxWidth: '1000px',
            mx: 'auto', // This centers the box
            width: '100%',
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;