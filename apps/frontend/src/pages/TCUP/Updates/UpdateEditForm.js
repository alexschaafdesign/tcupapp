import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, Switch, FormControlLabel, Snackbar, CircularProgress, IconButton } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { EditorState, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import EditorWithFormatting from '../../Chat/Components/EditorWithFormatting';
import ImageIcon from '@mui/icons-material/Image';
import CancelIcon from '@mui/icons-material/Cancel';

const UpdateEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    is_published: true
  });
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: ''
  });
  
  const { getAccessTokenSilently } = useAuth0();
  
  // Fetch the update data
  useEffect(() => {
    const fetchUpdate = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/updates/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch update');
        }
        
        const data = await response.json();
        
        // Set form data
        setFormData({
          title: data.title,
          is_published: data.is_published !== false
        });
        
        // Set image preview if exists
        if (data.image_url) {
          setImagePreview(data.image_url);
          setOriginalImageUrl(data.image_url);
        }
        
        // Initialize editor state from content_json if available
        if (data.content_json) {
          try {
            const contentJson = JSON.parse(data.content_json);
            const contentState = convertFromRaw(contentJson);
            setEditorState(EditorState.createWithContent(contentState));
          } catch (e) {
            console.error('Error parsing content JSON:', e);
            // Fallback to plain text
            setEditorState(
              EditorState.createWithContent(
                ContentState.createFromText(data.content || '')
              )
            );
          }
        } else if (data.content) {
          // Fallback to plain text
          setEditorState(
            EditorState.createWithContent(
              ContentState.createFromText(data.content)
            )
          );
        }
      } catch (error) {
        console.error('Error fetching update:', error);
        setSnackbar({
          open: true,
          message: 'Error loading update: ' + error.message
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpdate();
  }, [id, getAccessTokenSilently]);

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
    setOriginalImageUrl(null); // Also clear the original URL to indicate deletion
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = await getAccessTokenSilently();
      
      // Convert editor content to raw JSON
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      const contentJson = JSON.stringify(rawContent);
      
      // Generate plain text version for backward compatibility
      const plainText = contentState.getPlainText();
      
      // Upload image to Cloudinary if changed
      let imageUrl = originalImageUrl;
      if (image) {
        const imageData = new FormData();
        imageData.append('file', image);
        imageData.append('upload_preset', 'tcup_uploads');

        const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dsll3ms2c/image/upload', {
          method: 'POST',
          body: imageData
        });
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.secure_url;
      }
      
      // Update the post
      const response = await fetch(`${process.env.REACT_APP_API_URL}/updates/${id}`, {
        method: 'PUT',
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
        throw new Error('Failed to update post');
      }
      
      setSnackbar({
        open: true,
        message: 'Update saved successfully!'
      });
      
      // Navigate back to updates page after short delay
      setTimeout(() => {
        navigate('/updates');
      }, 1500);
    } catch (error) {
      console.error('Error updating post:', error);
      setSnackbar({
        open: true,
        message: 'Error updating post: ' + error.message
      });
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Edit Update
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
          autoFocus={false}
          focusTrigger={focusTrigger}
        />
        
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {imagePreview ? 'Current Image' : 'Add Image (Optional)'}
          </Typography>
          
          {!imagePreview ? (
            <>
              <input
                accept="image/*"
                id="image-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<ImageIcon />}
                >
                  Upload Image
                </Button>
              </label>
            </>
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
              
              {/* Add option to replace image */}
              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <input
                    accept="image/*"
                    id="replace-image"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <label htmlFor="replace-image">
                    <Button
                      variant="text"
                      component="span"
                      size="small"
                    >
                      Replace Image
                    </Button>
                  </label>
                </Box>
              )}
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
          label="Published"
          sx={{ mt: 2 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/updates')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !formData.title.trim() || !editorState.getCurrentContent().hasText()}
            sx={{ 
              background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #7b1fa2 30%, #c51162 90%)',
              }
            }}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </Box>
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

export default UpdateEditForm;