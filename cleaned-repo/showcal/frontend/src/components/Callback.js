// src/components/Callback.js
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material'; // Import Material UI components

function Callback() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAuth0();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/shows');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Handle potential errors
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <Typography color="error" variant="h6">
          Authentication Error: {error.message}
        </Typography>
      </Box>
    );
  }

  // Loading state with Material UI styling
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      gap: 2
    }}>
      <CircularProgress />
      <Typography variant="h6">
        Completing login...
      </Typography>
    </Box>
  );
}

export default Callback;