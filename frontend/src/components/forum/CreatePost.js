import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  TextField, 
  Button, 
  Box, 
  Chip,
  Paper,
  Typography,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

export const CreatePost = ({ onPostCreated, tags }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: []
  });

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const newPost = await response.json();
      onPostCreated(newPost);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        variant="outlined"
        sx={{ mb: 3 }}
        placeholder="What's on your mind?"
        autoFocus
      />
      
      <TextField
        fullWidth
        multiline
        rows={6}
        label="Content"
        value={formData.content}
        onChange={(e) => setFormData({...formData, content: e.target.value})}
        variant="outlined"
        sx={{ mb: 3 }}
        placeholder="Share your thoughts..."
      />
      
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Select Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              onClick={() => handleTagToggle(tag.id)}
              color={formData.tags.includes(tag.id) ? "primary" : "default"}
              variant={formData.tags.includes(tag.id) ? "filled" : "outlined"}
              sx={{ 
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: formData.tags.includes(tag.id) 
                    ? 'primary.dark' 
                    : 'action.hover'
                }
              }}
            />
          ))}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={!formData.title.trim() || !formData.content.trim()}
          endIcon={<SendIcon />}
          sx={{ px: 4, py: 1 }}
        >
          Post Discussion
        </Button>
      </Box>
    </form>
  );
};

export default CreatePost;