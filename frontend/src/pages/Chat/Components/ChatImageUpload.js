import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  IconButton, 
  Grid,
  Typography,
  Paper
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

const ChatImageUpload = ({ images, setImages }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding new files would exceed the limit
    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images per post.`);
      return;
    }
    
    // Check file size
    const oversizedFiles = files.filter(file => file.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the ${MAX_SIZE_MB}MB limit.`);
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const token = await getAccessTokenSilently();
      
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/upload/single`, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        return {
          url: response.data.url,
          publicId: response.data.public_id,
          width: response.data.width,
          height: response.data.height
        };
      });
      
      const uploadedImages = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedImages]);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemove = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // If no images and not uploading, show a minimal button
  if (images.length === 0 && !uploading && !error) {
    return (
      <Button
        variant="outlined"
        component="label"
        startIcon={<ImageIcon />}
        size="small"
        sx={{ my: 1 }}
      >
        Add Images
        <input
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={handleUpload}
        />
      </Button>
    );
  }
  
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">Images</Typography>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            {images.length}/{MAX_IMAGES}
          </Typography>
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<AddPhotoAlternateIcon />}
            size="small"
            disabled={uploading || images.length >= MAX_IMAGES}
          >
            Add
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={handleUpload}
            />
          </Button>
          
          {uploading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </Box>
      </Box>
      
      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
          {error}
        </Typography>
      )}
      
      {images.length > 0 && (
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {images.map((image, index) => (
            <Grid item key={index} xs={6} sm={4} md={3}>
              <Box
                sx={{
                  position: 'relative',
                  height: 0,
                  paddingTop: '75%',
                  backgroundColor: '#f0f0f0',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <img
                  src={image.url}
                  alt={`Preview ${index + 1}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                  onClick={() => handleRemove(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default ChatImageUpload;