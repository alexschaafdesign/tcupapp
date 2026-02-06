import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const VenueForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    venue: '',
    location: '',
    capacity: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // Fetch existing venue data if in edit mode
  useEffect(() => {
    const fetchVenueData = async () => {
      if (!isEditMode) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/venues/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch venue data');
        }
        const data = await response.json();
        const venueData = data.data || data;
        setFormData({
          venue: venueData.venue || '',
          location: venueData.location || '',
          capacity: venueData.capacity || '',
        });
        setImagePreview(venueData.cover_image || '');
      } catch (err) {
        setError('Failed to load venue data: ' + err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchVenueData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('venue', formData.venue);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('capacity', formData.capacity);
      if (imageFile) {
        formDataToSend.append('cover_image', imageFile);
      }

      const url = isEditMode 
        ? `${process.env.REACT_APP_API_URL}/venues/${id}`
        : `${process.env.REACT_APP_API_URL}/venues`;

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        body: formDataToSend, // FormData handles the content-type header automatically
      });

      if (!response.ok) {
        throw new Error(isEditMode ? 'Failed to update venue' : 'Failed to add venue');
      }

      navigate('/venues');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography>Loading venue data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEditMode ? 'Edit Venue' : 'Add New Venue'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Venue Name"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          {/* Image Upload */}
          <Box sx={{ mb: 3 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="cover-image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="cover-image-upload">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
              >
                <PhotoCamera />
              </IconButton>
              <Typography component="span" sx={{ ml: 1 }}>
                {imageFile ? imageFile.name : 'Upload Cover Image'}
              </Typography>
            </label>
            
            {imagePreview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/venues')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Venue' : 'Add Venue')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default VenueForm;