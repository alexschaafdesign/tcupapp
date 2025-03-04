// This is the "Latest Updates" preview box that lives at the top of the homepage

import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button, Paper } from '@mui/material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const UpdatesPreview = () => {
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
    <Box>
      {updates.map((update) => (
        <Paper
          key={update.id}
          elevation={0}
          onClick={() => viewUpdate(update.id)}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 1,
            transition: 'all 0.2s',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#f9f4fc',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" sx={{ color: '#9c27b0' }}>
              {update.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {format(new Date(update.created_at), 'MMM d, yyyy')}
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#333',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 1
            }}
          >
            {update.content}
          </Typography>
          
          {update.image_url && (
            <Box 
              sx={{ 
                height: '120px',
                width: '100%',
                overflow: 'hidden',
                borderRadius: 1,
                mb: 1
              }}
            >
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
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
              By {update.author_name}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#9c27b0',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              Read more <ArrowForwardIcon fontSize="small" />
            </Typography>
          </Box>
        </Paper>
      ))}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button 
          variant="outlined" 
          onClick={viewAllUpdates}
         
        >
          View All Updates!!
        </Button>
      </Box>
    </Box>
  );
};

export default UpdatesPreview;