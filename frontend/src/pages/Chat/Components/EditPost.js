import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Button, Typography, DialogTitle, DialogContent, DialogActions, CircularProgress, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import EditorWithFormatting from './EditorWithFormatting';
import ChatImageUpload from './ChatImageUpload';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';

const EditPostForm = ({ post, onClose, onSave }) => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Initialize the editor with the post content
    if (post && post.content) {
        try {
          const contentObj = typeof post.content === 'string' 
            ? JSON.parse(post.content) 
            : post.content;
          
          // Create a new empty editor state first
          let newEditorState = EditorState.createEmpty();
          
          // Then apply the content from the post
          const contentState = convertFromRaw(contentObj);
          newEditorState = EditorState.createWithContent(contentState);
          
          // Update the state with this clean version
          setEditorState(newEditorState);
        } catch (e) {
          console.error('Error parsing post content:', e);
          setEditorState(EditorState.createEmpty());
        }
      }

    // Initialize images if they exist
    if (post && post.images) {
      setImages(post.images || []);
    }
  }, [post]);

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const token = await getAccessTokenSilently();
      const contentState = editorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
      
      // Use the existing route for editing posts
      const response = await fetch(`${apiUrl}/posts/edit/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: rawContent,
          images: images,
          userId: user.sub,
          title: post.title,
          createdAt: post.created_at,
          tags: post.tags
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      const updatedPost = await response.json();
      onSave(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      setErrorMessage(error.message || 'Failed to update post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
        <Box sx={{ width: '100%' }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Edit Post</Typography>
            <IconButton onClick={onClose} disabled={loading}>
                <CloseIcon />
            </IconButton>
            </DialogTitle>
      
      <DialogContent dividers>
        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}
        
        <Box sx={{ mb: 2 }}>
          <EditorWithFormatting
            editorState={editorState}
            setEditorState={setEditorState}
          />
        </Box>
        
        <ChatImageUpload 
          images={images} 
          setImages={setImages} 
        />
      </DialogContent>
      
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave} 
          disabled={loading || !editorState.getCurrentContent().hasText()}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default EditPostForm;