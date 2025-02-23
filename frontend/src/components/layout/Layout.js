import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import TopBar from './TopBar.js';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* TopBar component replaces the simple purple bar */}
      <TopBar />
      
      {/* Navigation */}
      <Header />
      
      {/* Content wrapper */}
      <Box
        component="main"
        sx={{
          width: '100%',
          minHeight: '100vh',
          marginLeft: { xs: 0, md: 0 },
          paddingTop: '20px',
          backgroundColor: "#eeeeee"
        }}
      >
        {/* Centered content */}
        <Box
          sx={{
            maxWidth: { xs: '100%', sm: '90%', md: '1200px', lg: '1400px' }, // Wider on larger screens
            mx: 'auto', // Centers the box
            width: '100%',
            px: { xs: 2, sm: 3, md: 4, lg: 3 }, // Adds padding for different breakpoints
            py: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;