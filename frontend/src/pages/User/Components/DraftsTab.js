// DraftsTab.jsx - Create this in the same folder as your other tabs
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, List, ListItem, ListItemText, 
  ListItemAvatar, Avatar, Button, Divider, CircularProgress,
  Paper, Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';
import { useAuth0 } from '@auth0/auth0-react';

const DraftsTab = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log("API URL being used:", process.env.REACT_APP_API_URL);
    const fetchDrafts = async () => {
      try {
        setLoading(true);
        
        // Get the auth token
        const token = await getAccessTokenSilently();
        
        // Fetch bands and filter for drafts
        const response = await fetch(`${apiUrl}/bands/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch band drafts');
        }
        
        const data = await response.json();
        
        // Filter to only include drafts
        const draftBands = data.filter(band => band.is_draft);
        setDrafts(draftBands);
      } catch (err) {
        console.error('Error fetching drafts:', err);
        setError('Failed to load your band drafts');
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [getAccessTokenSilently, apiUrl]);

  const handleResume = (draftId) => {
    navigate(`/bands/form/${draftId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
    );
  }

  if (drafts.length === 0) {
    return (
      <Paper sx={{ p: 3, m: 2, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          You don't have any band drafts in progress.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/bands/add')}
          >
            Add a band
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {drafts.map((draft, index) => (
        <React.Fragment key={draft.id}>
          {index > 0 && <Divider component="li" />}
          <ListItem 
            alignItems="flex-start"
            secondaryAction={
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={() => handleResume(draft.id)}
              >
                Resume
              </Button>
            }
          >
            <ListItemAvatar>
              {draft.profile_image ? (
                <Avatar src={draft.profile_image} alt={draft.name} />
              ) : (
                <Avatar>
                  <MusicNoteIcon />
                </Avatar>
              )}
            </ListItemAvatar>
            <ListItemText
              primary={draft.name || "Untitled Band"}
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    Last updated: {format(new Date(draft.updated_at), 'MMM d, yyyy h:mm a')}
                  </Typography>
                  {draft.location && (
                    <>
                      {' — '}
                      {draft.location}
                    </>
                  )}
                </>
              }
            />
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
};

export default DraftsTab;