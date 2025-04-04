import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Header from './Header';
import TopBar from './TopBar.js';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Layout = ({ publicAccess = false }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  // Add debugging
  console.log('Layout render:', { 
    publicAccess, 
    isAuthenticated, 
    isLoading,
    authChecked,
    path: location.pathname 
  });

  // Wait for auth to initialize before making any decisions
  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  // Show loading state while we check authentication
  if (!authChecked) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Public routes are always accessible
  if (publicAccess) {
    return (
      <LayoutContent publicAccess={publicAccess} />
    );
  }

  // At this point, we know auth is checked and this is a protected route
  if (!isAuthenticated) {
    console.log('Redirecting to welcome page from:', location.pathname);
    return <Navigate to="/welcome" state={{ from: location }} />;
  }

  // User is authenticated and this is a protected route
  return (
    <LayoutContent publicAccess={publicAccess} />
  );
};

// Separate the layout content for cleaner code
const LayoutContent = ({ publicAccess }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* TopBar component */}
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