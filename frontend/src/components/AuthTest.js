// src/components/AuthTest.jsx
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import { 
  Button, 
  Paper, 
  Typography, 
  Box,
  CircularProgress
} from '@mui/material';

function AuthTest() {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          console.log('Getting access token...');
          const accessToken = await getAccessTokenSilently({
            audience: process.env.REACT_APP_AUTH0_API_IDENTIFIER,
            scope: 'openid profile email'
          });
          console.log('Token obtained:', accessToken);
          setToken(accessToken);
        } catch (e) {
          console.error('Error getting token:', e);
          setError(e.message);
        }
      }
    };
    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  const testAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get a fresh token
      console.log('Getting fresh token for request...');
      const accessToken = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_API_IDENTIFIER,
        scope: 'openid profile email'
      });
      
      console.log('Making request with token:', accessToken);

      const response = await fetch('http://localhost:3001/api/users/test-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Success response:', data);
      setResult(data);
    } catch (err) {
      console.error('Test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 2, bgcolor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>
        Auth Test Component
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Authentication Status:</Typography>
        <Typography>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Typography>
        <Typography>Is Loading: {isLoading ? 'Yes' : 'No'}</Typography>
        <Typography>Token Available: {token ? 'Yes' : 'No'}</Typography>
      </Box>

      <Button 
        variant="contained" 
        onClick={testAuth}
        disabled={loading || !isAuthenticated}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Test Authentication'}
      </Button>

      {error && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}

      {result && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
          <Typography gutterBottom>Success! Server responded with:</Typography>
          <pre style={{ 
            overflowX: 'auto',
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Box>
      )}

      <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>Debug Information:</Typography>
        <Typography variant="body2">
          API URL: {process.env.REACT_APP_AUTH0_API_IDENTIFIER}
        </Typography>
        <Typography variant="body2">
          Auth0 Domain: {process.env.REACT_APP_AUTH0_DOMAIN}
        </Typography>
      </Box>
    </Paper>
  );
}

export default AuthTest;