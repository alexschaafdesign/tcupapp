import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Snackbar,
} from '@mui/material';

const ShowProfileMinimal = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const response = await fetch(`${apiUrl}/shows/${id}`);
        if (!response.ok) throw new Error("Show not found");
        const showData = await response.json();
        setShow(showData);
      } catch (error) {
        setError(error.message || "An error occurred while fetching the show.");
      } finally {
        setLoading(false);
      }
    };

    if (id && apiUrl) {
      fetchShow();
    } else {
      setError("Invalid show ID or API URL");
      setLoading(false);
    }
  }, [id, apiUrl]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${apiUrl}/shows/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete show');
      }

      // Close the dialog and redirect to shows list
      setDeleteDialogOpen(false);
      navigate('/shows', { 
        state: { 
          message: 'Show deleted successfully',
          severity: 'success'
        }
      });
    } catch (error) {
      setDeleteError(error.message);
      // Keep the dialog open if there's an error
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteError(null);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleBandClick = (bandId) => {
    if (bandId) {
      navigate(`/bands/${bandId}`);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {show && show.name}
      </Typography>

      {/* Show Flyer */}
      <Box sx={{ display: "flex", justifyContent: "center", padding: "0px", mt: 3 }}>
        {show.flyer_image ? (
          <img
            src={show.flyer_image}
            alt="Show Flyer"
            style={{
              maxWidth: '100%',
              width: '500px',
              borderRadius: '8px',
              objectFit: 'contain',
            }}
          />
        ) : (
          <Typography>No Flyer Available</Typography>
        )}
      </Box>

      <Box sx={{ marginTop: 3 }}>
        {show.event_link ? (
          <Typography variant="h4" gutterBottom>
            <a href={show.event_link} target="_blank" rel="noopener noreferrer">
              GET TICKETS / MORE INFO
            </a>
          </Typography>
        ) : (
          <Typography>No event link available</Typography>
        )}
      </Box>

      {show.bands && show.bands.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", mt: 3, marginBottom: 3 }}>
          {show.bands.map((band, index) => (
            <Typography
              key={band.id}
              variant={index === 0 ? "h4" : "h4"}
              sx={{
                fontWeight: band.id ? 'bold' : 'normal',
                fontSize: index === 0 ? '2rem' : '2rem',
                marginTop: index === 0 ? 0 : 1,
                color: band.id ? 'primary.main' : 'text.secondary',
                cursor: 'pointer',
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
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                />
              )}
            </Typography>
          ))}
        </Box>
      )}

      {/* Show Details */}
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom>
          <strong>Start Time:</strong> {new Date(show.start).toLocaleString()}
        </Typography>

        <Typography variant="h6" gutterBottom>
          <strong>Venue:</strong> {show.venue_name}
        </Typography>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/shows')}>
          Back to Shows
        </Button>
        <Button variant="contained" color="secondary" onClick={() => navigate(`/shows/${id}/edit`)}>
          Edit Show
        </Button>
        <Button variant="contained" color="error" onClick={handleDeleteClick}>
          Delete Show
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Show</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          ) : (
            <Typography>
              Are you sure you want to delete this show? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShowProfileMinimal;