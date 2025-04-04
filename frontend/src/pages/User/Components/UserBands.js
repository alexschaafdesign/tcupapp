// src/pages/User/Components/UserBands.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Typography, List, ListItem, ListItemText, ListItemAvatar, 
  Avatar, Chip, Button, Divider, CircularProgress, 
  Link, Card, CardContent, Grid, IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  MusicNote as MusicNoteIcon
} from '@mui/icons-material';
import useApi from '../../../hooks/useApi';

const UserBands = ({ isOwnProfile }) => {
  const [bands, setBands] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { apiClient } = useApi();
  
  useEffect(() => {
    const fetchBands = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get user bands (published and drafts)
        const response = await apiClient.get('/bands/user');
        
        // Separate drafts from published bands
        setBands(response.data.filter(band => !band.is_draft));
        setDrafts(response.data.filter(band => band.is_draft));
      } catch (error) {
        console.error('Error fetching bands:', error);
        setError('Failed to load bands. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isOwnProfile) {
      fetchBands();
    } else {
      // For non-owners, just get published bands associated with this user
      const fetchPublicBands = async () => {
        try {
          setLoading(true);
          setError(null);
          // This would be a different endpoint that gets bands claimed by a user
          // We'll use the URL parameter to get the user's ID
          const userId = window.location.pathname.split('/').pop();
          if (userId) {
            const response = await apiClient.get(`/bands/user/${userId}/public`);
            setBands(response.data);
          }
          setDrafts([]);
        } catch (error) {
          console.error('Error fetching public bands:', error);
          setError('Failed to load bands. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchPublicBands();
    }
  }, [apiClient, isOwnProfile]);
  
  const handleContinueEditing = (draftId) => {
    navigate(`/bands/form/${draftId}`);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography color="error">{error}</Typography>
        {isOwnProfile && (
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        )}
      </Box>
    );
  }
  
  return (
    <Box>
      {isOwnProfile && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            My Bands
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/bands/form"
            size="small"
          >
            Add New Band
          </Button>
        </Box>
      )}
      
      {/* Drafts Section - Only shown to the profile owner */}
      {isOwnProfile && drafts.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Draft Bands
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Continue where you left off with these incomplete band profiles.
            </Typography>
            
            <List sx={{ p: 0 }}>
              {drafts.map((draft, index) => (
                <React.Fragment key={draft.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem 
                    alignItems="flex-start"
                    secondaryAction={
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleContinueEditing(draft.id)}
                        sx={{ mt: 1 }}
                      >
                        Continue
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={draft.profile_image} 
                        alt={draft.name}
                        sx={{ bgcolor: 'primary.main' }}
                      >
                        {draft.name ? draft.name[0].toUpperCase() : <MusicNoteIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {draft.name || "Unnamed Band"}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.secondary">
                            Last edited: {new Date(draft.updated_at).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip 
                              size="small" 
                              label={`${getCompletionPercentage(draft.completion_status)}% complete`} 
                              color="primary" 
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
      
      {/* Published Bands Section */}
      {bands.length > 0 ? (
        <Grid container spacing={2}>
          {bands.map(band => (
            <Grid item xs={12} sm={6} key={band.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar 
                      src={band.profile_image} 
                      alt={band.name}
                      sx={{ mr: 1.5, width: 48, height: 48 }}
                    >
                      {!band.profile_image && <MusicNoteIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {band.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {band.location}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', mt: 2, justifyContent: 'flex-end' }}>
                    {isOwnProfile && (
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        component={RouterLink}
                        to={`/bands/form/${band.id}`}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/bands/${band.custom_slug || band.slug || band.id}`}
                      startIcon={<VisibilityIcon />}
                      variant="outlined"
                    >
                      View
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {isOwnProfile 
              ? "You don't have any bands yet. Get started by adding one!"
              : "This user hasn't added any bands yet."}
          </Typography>
          {isOwnProfile && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/bands/form"
              sx={{ mt: 2 }}
            >
              Add Band
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

// Helper function to calculate completion percentage from the status JSON
const getCompletionPercentage = (completionStatus) => {
  if (!completionStatus) return 0;
  
  try {
    const status = typeof completionStatus === 'string' 
      ? JSON.parse(completionStatus) 
      : completionStatus;
      
    const steps = Object.keys(status);
    if (steps.length === 0) return 0;
    
    const completedSteps = steps.filter(step => status[step]).length;
    return Math.round((completedSteps / steps.length) * 100);
  } catch (error) {
    console.error('Error calculating completion percentage:', error);
    return 0;
  }
};

export default UserBands;