import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Breadcrumbs, Link, CircularProgress, Divider, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const UpdatesPage = () => {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/updates`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch updates');
        }
        
        const data = await response.json();
        setUpdates(data);
      } catch (error) {
        console.error('Error fetching updates:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpdates();
  }, []);

  const handleNavigateHome = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const viewUpdate = (id) => {
    navigate(`/updates/${id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link 
            color="inherit" 
            href="/"
            onClick={handleNavigateHome}
          >
            Home
          </Link>
          <Typography color="text.primary">Updates</Typography>
        </Breadcrumbs>
        
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h5" color="error">
            Error
          </Typography>
          <Typography>
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Breadcrumbs sx={{ mb: 4 }}>
        <Link 
          color="inherit" 
          href="/"
          onClick={handleNavigateHome}
        >
          Home
        </Link>
        <Typography color="text.primary">Updates</Typography>
      </Breadcrumbs>
      
      <Typography 
        variant="h3" 
        sx={{ 
          mb: 4,
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Latest Updates
      </Typography>
      
      {updates.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Typography sx={{ color: '#666', fontStyle: 'italic' }}>
            No updates available yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {updates.map((update) => (
            <Grid item xs={12} sm={6} md={4} key={update.id}>
              <Paper 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => viewUpdate(update.id)}
              >
                {update.image_url ? (
                  <Box sx={{ height: 200, overflow: 'hidden' }}>
                    <img 
                      src={update.image_url} 
                      alt={update.title}
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }} 
                    />
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      height: 60,
                      background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)'
                    }} 
                  />
                )}
                
                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 'bold',
                      color: '#333'
                    }}
                  >
                    {update.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      flexGrow: 1
                    }}
                  >
                    {update.content}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {format(new Date(update.created_at), 'MMM d, yyyy')}
                    </Typography>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#9c27b0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      Read more <ArrowForwardIcon sx={{ fontSize: 14 }} />
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default UpdatesPage;