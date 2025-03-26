import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const ScraperAdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  
  // Get access to Auth0 functions to retrieve the token
  const { getAccessTokenSilently } = useAuth0();
  // Get the API URL from environment variables
  const apiUrl = process.env.REACT_APP_API_URL;

  const runScrapers = async (scraper = null) => {
    setLoading(true);
    setError('');
    setLogs([]);
    try {
      // Retrieve a valid access token from Auth0
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/scrapers/run-scrapers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scraper })
      });
      if (!response.ok) {
        throw new Error('Error running scrapers');
      }
      const data = await response.json();
      setLogs(data.logs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Run Scrapers
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => runScrapers()}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            'Run All Scrapers'
          )}
        </Button>
        <Button
          variant="outlined"
          onClick={() => runScrapers('331_club')}
          disabled={loading}
        >
          Run 331 Club
        </Button>
        <Button
          variant="outlined"
          onClick={() => runScrapers('aster_cafe')}
          disabled={loading}
        >
          Run Aster Café
        </Button>
        <Button
          variant="outlined"
          onClick={() => runScrapers('berlin_mpls')}
          disabled={loading}
        >
          Run BerlinMPLS
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      {logs.length > 0 && (
        <Box>
          <Typography variant="h6">Run Logs</Typography>
          {logs.map((log, idx) => (
            <Box key={idx} sx={{ mt: 2, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
              <Typography variant="body2">
                {log.scraper_name} ran at: {new Date().toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Added: {log.added_count}, Duplicates: {log.duplicate_count}
              </Typography>
              {log.added_shows && log.added_shows.length > 0 && (
                <Typography variant="caption">
                  Show IDs: {log.added_shows.join(', ')}
                </Typography>
              )}
              {log.errors && log.errors.length > 0 && (
                <Typography variant="caption" color="error">
                  Errors: {log.errors.join('; ')}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ScraperAdminPanel;