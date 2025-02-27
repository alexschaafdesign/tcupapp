import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const AuthContentOverlay = ({ children }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Always render the content */}
      <Box sx={{ 
        filter: isAuthenticated ? 'none' : 'blur(5px)',
        opacity: isAuthenticated ? 1 : 0.7,
        pointerEvents: isAuthenticated ? 'auto' : 'none',
      }}>
        {children}
      </Box>
      
      {/* Only show overlay when not authenticated */}
      {!isAuthenticated && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          zIndex: 10,
        }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
            You must be logged in to view this section
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => loginWithRedirect()}
            sx={{ 
              bgcolor: '#689f69',
              '&:hover': { bgcolor: '#5a8a5b' },
              textTransform: 'uppercase',
              px: 4
            }}
          >
            LOG IN
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AuthContentOverlay;