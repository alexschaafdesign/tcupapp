// PublicRoute.js - Create this file
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, CircularProgress } from '@mui/material';
import Header from './components/layout/Header';
import TopBar from './components/layout/TopBar.js';

// This component renders content unconditionally without auth checks
const PublicRoute = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* TopBar component */}
      <TopBar isPublic={true} />
      
      {/* Navigation */}
      <Header isPublic={true} />
      
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

export default PublicRoute;