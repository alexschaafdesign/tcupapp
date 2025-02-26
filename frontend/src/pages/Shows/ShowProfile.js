import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Container,
  Card,
  CardContent,
  IconButton,
  Stack,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useAuth } from '../../hooks/useAuth';

const ShowProfile = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authAction, setAuthAction] = useState(''); // 'edit' or 'delete'
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const { isAdmin, isModerator, isAuthenticated } = useAuth();
  const canEdit = isAdmin || isModerator;



  useEffect(() => {
    const fetchShow = async () => {
      try {
        const response = await fetch(`${apiUrl}/shows/${id}`);
        if (!response.ok) throw new Error("Show not found");
        const showData = await response.json();
        setShow(showData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && apiUrl) fetchShow();
  }, [id, apiUrl]);

  const handleDeleteClick = () => {
    if (isAuthenticated && isAdmin) { // Only admins can delete
      setDeleteDialogOpen(true);
    } else {
      setAuthAction('delete');
      setAuthDialogOpen(true);
    }
  };
  

  const handleEditClick = () => {
    if (isAuthenticated && canEdit) { // Admin or moderator can edit
      navigate(`/shows/${id}/edit`);
    } else {
      setAuthAction('edit');
      setAuthDialogOpen(true);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteError(null);
  };

  const handleAuthDialogClose = () => {
    setAuthDialogOpen(false);
    setAuthAction('');
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${apiUrl}/shows/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete show');
      setDeleteDialogOpen(false);
      navigate('/shows', { 
        state: { message: 'Show deleted successfully', severity: 'success' }
      });
    } catch (error) {
      setDeleteError(error.message);
    }
  };

  const handleBandClick = (bandId) => {
    if (bandId) navigate(`/bands/${bandId}`);
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (error) return <Container><Alert severity="error">{error}</Alert></Container>;
  if (!show) return null;

  const showDate = new Date(show.start);
  const formattedDate = showDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = showDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Event Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="overline" 
          color="primary.main" 
          sx={{ 
            display: 'block',
            mb: 1,
            letterSpacing: 2,
            fontWeight: 'bold'
          }}
        >
          {show.venue_name.toUpperCase()}
        </Typography>
        
        {show.bands && show.bands.map((band, index) => (
          <Typography
            key={band.id || index}
            variant="h2"
            sx={{
              fontSize: index === 0 ? '3rem' : '2rem',
              fontWeight: band.id ? 700 : 500,
              color: band.id ? 'primary.main' : 'text.primary',
              cursor: band.id ? 'pointer' : 'default',
              lineHeight: 1.2,
              mb: 1,
              textTransform: 'capitalize',
            }}
            onClick={() => handleBandClick(band.id)}
          >
            {band.name}
            {band.id && (
              <Chip
                label="TCUP BAND"
                color="primary"
                size="small"
                sx={{ ml: 2, verticalAlign: 'middle' }}
              />
            )}
          </Typography>
        ))}
      </Box>

      {/* Show Flyer */}
      {show.flyer_image && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <img
            src={show.flyer_image}
            alt="Show Flyer"
            style={{
              maxWidth: '100%',
              width: 'auto',
              maxHeight: '600px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          />
        </Box>
      )}

      {/* Event Details Card */}
      <Box sx={{ 
        bgcolor: 'white', 
        borderRadius: 2,
        p: 3,
        mb: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 4, 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'left'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            color: 'text.primary'
          }}>
            <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {formattedDate}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 0.5
          }}>
            <LocationOnIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Link 
              to={`/venues/${show.venue_id}`}
              style={{ 
                textDecoration: 'none',
                color: 'var(--mui-palette-primary-main)',
                '&:hover': { textDecoration: 'underline' }
              }}
              className="hover:underline"
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {show.venue_name}
              </Typography>
            </Link>
          </Box>

        {show.event_link && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 0.5
          }}>
            <ConfirmationNumberIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <a 
              href={show.event_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                textDecoration: 'none',
                color: 'var(--mui-palette-primary-main)',
                '&:hover': { textDecoration: 'underline' }
              }}
              className="hover:underline"
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Tickets / More info
              </Typography>
            </a>
          </Box>
        )}
      </Box>
        </Box>
      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
      <Button variant="outlined" onClick={() => navigate('/shows')}>
        Back to Shows
      </Button>
      {canEdit && (
        <Button variant="contained" onClick={handleEditClick}>
          Edit Show
        </Button>
      )}
      {isAdmin && (
        <Button variant="danger" color="error" onClick={handleDeleteClick}>
          Delete Show
        </Button>
      )}
      <IconButton aria-label="share">
        <ShareIcon />
      </IconButton>
    </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Show</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>
          ) : (
            <Typography>Are you sure you want to delete this show? This action cannot be undone.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Authentication Required Dialog */}
      <Dialog open={authDialogOpen} onClose={handleAuthDialogClose}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            You must be registered and logged in to {authAction === 'edit' ? 'edit' : 'delete'} a show.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAuthDialogClose}>Close</Button>
          <Button 
            color="primary" 
            variant="contained"
            onClick={() => {
              handleAuthDialogClose();
              navigate('/login'); // Assumes you have a /login route
            }}
          >
            Log In / Register
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ShowProfile;