import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import TopBar from './TopBar.js';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Layout = ({ publicAccess = false }) => {
  const { isAuthenticated } = useAuth0();
  const location = useLocation();

  // If this is not a public route and user is not authenticated, redirect to welcome
  if (!publicAccess && !isAuthenticated) {
    return <Navigate to="/welcome" state={{ from: location }} />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* TopBar component replaces the simple purple bar */}
      <TopBar isPublic={publicAccess} />

      
      {/* Navigation */}
      <Header isPublic={publicAccess} />
      
      {/* Content wrapper */}
      <Box
        component="main"
        sx={{
          width: '100%',
          minHeight: '100vh',
          marginLeft: { xs: 0, md: 0 },
          paddingTop: 6,
          backgroundColor: "#eeeeee"
        }}
      >
        {/* Centered content */}
        <Box
          sx={{
            maxWidth: { xs: '100%', sm: '90%', md: '1200px', lg: '1400px' }, 
            mx: 'auto',
            width: '100%',
            px: { xs: 2, sm: 3, md: 4, lg: 3 },
            py: 4,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;