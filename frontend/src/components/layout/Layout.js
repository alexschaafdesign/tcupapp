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
            maxWidth: '1000px',
            mx: 'auto', // This centers the box
            width: '100%',
            px: { xs: 2, sm: 3, md: 0 },
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