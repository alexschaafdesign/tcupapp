// This is the "Latest Updates" preview box that lives at the top of the homepage


import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button, Grid, Paper } from '@mui/material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import palette from '../../../styles/colors/palette';

const UpdatesSection = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/updates?limit=3`);
        
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

  const viewAllUpdates = () => {
    navigate('/updates');
  };

  const viewUpdate = (id) => {
    navigate(`/updates/${id}`);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Typography color="error" sx={{ py: 2 }}>
        Error loading updates: {error}
      </Typography>
    );
  }
  
  if (updates.length === 0) {
    return (
      <Typography sx={{ color: '#666', py: 2, fontStyle: 'italic' }}>
        No updates available yet.
      </Typography>
    );
  }
  
  return (
    <>
      <Grid container spacing={3}>
        {updates.map((update) => (
          <Grid item xs={12} md={4} key={update.id}>
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
                <Box sx={{ height: 160, overflow: 'hidden' }}>
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
              
              <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="outlined" 
          onClick={viewAllUpdates}
          
        >
          View All Updates
        </Button>
      </Box>
    </>
  );
};

export default UpdatesSection;