import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, Switch, FormControlLabel, Snackbar, CircularProgress, IconButton } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import EditorWithFormatting from '../../Chat/Components/EditorWithFormatting';
import ImageIcon from '@mui/icons-material/Image';
import CancelIcon from '@mui/icons-material/Cancel';

const NewUpdate = () => {
  const [formData, setFormData] = useState({
    title: '',
    is_published: true
  });
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: ''
  });
  
  const { getAccessTokenSilently } = useAuth0();
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'is_published' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create object URL for preview
      setImagePreview(URL.createObjectURL(file));
      setImage(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImage(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = await getAccessTokenSilently();
      
      // Convert editor content to raw JSON
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      const contentJson = JSON.stringify(rawContent);
      
      // Generate plain text version for backward compatibility
      const plainText = contentState.getPlainText();
      
      // Upload image to Cloudinary if present
      let imageUrl = null;
      if (image) {
        const imageData = new FormData();
        imageData.append('file', image);
        imageData.append('upload_preset', 'tcup_uploads'); // Create this preset in Cloudinary

        const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dsll3ms2c/image/upload', {
          method: 'POST',
          body: imageData
        });
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.secure_url;
      }
      
      // Create the update
      const response = await fetch(`${process.env.REACT_APP_API_URL}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: plainText,
          content_json: contentJson,
          image_url: imageUrl,
          is_published: formData.is_published
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create update');
      }
      
      // Reset form
      setFormData({
        title: '',
        is_published: true
      });
      setEditorState(EditorState.createEmpty());
      setImage(null);
      setImagePreview(null);
      
      setSnackbar({
        open: true,
        message: 'Update created successfully!'
      });
    } catch (error) {
      console.error('Error creating update:', error);
      setSnackbar({
        open: true,
        message: 'Error creating update: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const focusEditor = () => {
    setFocusTrigger(prev => prev + 1);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Create Update
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          margin="normal"
        />
        
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Content
        </Typography>
        
        <EditorWithFormatting 
          editorState={editorState}
          setEditorState={setEditorState}
          autoFocus={true}
          focusTrigger={focusTrigger}
        />
        
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Add Image (Optional)
          </Typography>
          
          <input
            accept="image/*"
            id="image-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          
          {!imagePreview ? (
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<ImageIcon />}
              >
                Upload Image
              </Button>
            </label>
          ) : (
            <Box sx={{ position: 'relative', width: 'fit-content' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
              />
              <IconButton 
                onClick={removeImage}
                sx={{ 
                  position: 'absolute', 
                  top: -10, 
                  right: -10,
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
                size="small"
              >
                <CancelIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_published}
              onChange={handleChange}
              name="is_published"
              color="primary"
            />
          }
          label="Publish immediately"
          sx={{ mt: 2 }}
        />
        
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !formData.title.trim() || !editorState.getCurrentContent().hasText()}
          sx={{ 
            mt: 3,
            background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #7b1fa2 30%, #c51162 90%)',
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Update'}
        </Button>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Paper>
  );
};

export default NewUpdate;